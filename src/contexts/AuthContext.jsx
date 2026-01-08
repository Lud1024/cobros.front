import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const AuthContext = createContext(null);

// Configuración del timeout (en milisegundos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const WARNING_TIME = 2 * 60 * 1000; // Advertencia 2 minutos antes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Función para limpiar todos los timeouts
  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  // Función para cerrar sesión por inactividad
  const handleInactivityLogout = useCallback(() => {
    clearAllTimeouts();
    authService.logout();
    setUser(null);
    setShowWarning(false);
  }, [clearAllTimeouts]);

  // Función para mostrar advertencia
  const showInactivityWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(WARNING_TIME / 1000); // Convertir a segundos

    // Iniciar countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timeout final para cerrar sesión
    timeoutRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, WARNING_TIME);
  }, [handleInactivityLogout]);

  // Función para resetear el timeout de inactividad
  const resetInactivityTimeout = useCallback(() => {
    if (!user) return;

    clearAllTimeouts();
    setShowWarning(false);

    // Mostrar advertencia antes del timeout final
    warningTimeoutRef.current = setTimeout(() => {
      showInactivityWarning();
    }, INACTIVITY_TIMEOUT - WARNING_TIME);
  }, [user, clearAllTimeouts, showInactivityWarning]);

  // Función para continuar la sesión
  const handleContinueSession = useCallback(() => {
    setShowWarning(false);
    clearAllTimeouts();
    resetInactivityTimeout();
  }, [clearAllTimeouts, resetInactivityTimeout]);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimeout();
    };

    // Agregar listeners para detectar actividad
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Iniciar el timeout cuando hay un usuario
    resetInactivityTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimeouts();
    };
  }, [user, resetInactivityTimeout, clearAllTimeouts]);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (usuario, password) => {
    const data = await authService.login(usuario, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    clearAllTimeouts();
    authService.logout();
    setUser(null);
    setShowWarning(false);
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permiso) => {
    if (!user || !user.permisos) return false;
    return user.permisos[permiso] === true;
  };

  // Verificar si el usuario tiene alguno de los permisos (OR)
  const hasAnyPermission = (permisos) => {
    if (!user || !user.permisos) return false;
    return permisos.some(p => user.permisos[p] === true);
  };

  // Verificar si el usuario tiene todos los permisos (AND)
  const hasAllPermissions = (permisos) => {
    if (!user || !user.permisos) return false;
    return permisos.every(p => user.permisos[p] === true);
  };

  // Verificar si el usuario tiene acceso a una cartera
  const hasCarteraAccess = (idCartera) => {
    if (!user || !user.carteras) return false;
    return user.carteras.includes(idCartera);
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (nombreRol) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.nombre_rol.toLowerCase() === nombreRol.toLowerCase());
  };

  // Obtener las carteras a las que el usuario tiene acceso
  const getUserCarteras = () => {
    return user?.rolesPorCartera || [];
  };

  const value = {
    user,
    login,
    logout,
    register,
    // derive isAuthenticated from current user state so it's reactive
    isAuthenticated: !!user,
    loading,
    // Funciones de permisos y roles
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasCarteraAccess,
    hasRole,
    getUserCarteras,
    // Acceso directo a roles y permisos
    roles: user?.roles || [],
    permisos: user?.permisos || {},
    carteras: user?.carteras || [],
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Diálogo de advertencia de inactividad */}
      <Dialog 
        open={showWarning} 
        onClose={() => {}} // Prevenir cerrar con ESC o click fuera
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
          Sesión por Expirar
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Tu sesión está a punto de expirar por inactividad.
          </Typography>
          <Typography variant="h5" color="error" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            ¿Deseas continuar con tu sesión?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleInactivityLogout} 
            color="error"
            variant="outlined"
          >
            Cerrar Sesión
          </Button>
          <Button 
            onClick={handleContinueSession} 
            variant="contained"
            autoFocus
          >
            Continuar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
