import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
  Badge,
  Collapse,
  SwipeableDrawer,
  Fab,
  Zoom,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccountBalance,
  Payment,
  Assessment,
  Settings,
  AccountCircle,
  Logout,
  Receipt,
  Assignment,
  Schedule,
  Folder,
  PersonOutline,
  Description,
  Security,
  CheckCircle,
  Cancel,
  Policy,
  Warning,
  TrendingUp,
  VerifiedUser,
  Link,
  SupervisedUserCircle,
  ExpandLess,
  ExpandMore,
  Refresh,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;
const drawerWidthCollapsed = 72;

// Definición de items del menú con permisos por módulo
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/app/dashboard' },
  { divider: true, label: 'CLIENTES' },
  { text: 'Clientes', icon: <People />, path: '/app/clientes', permission: 'clientes' },
  { text: 'Documentos', icon: <Description />, path: '/app/cliente-documentos', permission: 'clientes' },
  { divider: true, label: 'PRÉSTAMOS' },
  { text: 'Préstamos', icon: <AccountBalance />, path: '/app/prestamos', permission: 'prestamos' },
  { text: 'Garantías', icon: <Security />, path: '/app/prestamo-garantia', permission: 'prestamos' },
  { text: 'Verificaciones', icon: <CheckCircle />, path: '/app/verificaciones-prestamo', permission: 'prestamos' },
  { text: 'Rechazos', icon: <Cancel />, path: '/app/rechazos-historial', permission: 'prestamos' },
  { divider: true, label: 'PAGOS Y CUOTAS' },
  { text: 'Pagos', icon: <Payment />, path: '/app/pagos', permission: 'pagos' },
  { text: 'Aplicación Pagos', icon: <TrendingUp />, path: '/app/pago-aplicaciones', permission: 'pagos' },
  { text: 'Cuotas', icon: <Schedule />, path: '/app/cuotas', permission: 'pagos' },
  { divider: true, label: 'MORA Y COBRO' },
  { text: 'Eventos de Mora', icon: <Warning />, path: '/app/mora-eventos', permission: 'mora' },
  { text: 'Políticas de Mora', icon: <Policy />, path: '/app/politicas-mora', permission: 'mora' },
  { text: 'Visitas de Cobro', icon: <Assignment />, path: '/app/visitas-cobro', permission: 'mora' },
  { divider: true, label: 'CONFIGURACIÓN' },
  { text: 'Carteras', icon: <Folder />, path: '/app/carteras', permission: 'configuracion' },
  { text: 'Métodos Garantía', icon: <VerifiedUser />, path: '/app/metodos-garantia', permission: 'configuracion' },
  { text: 'Periodicidades', icon: <Schedule />, path: '/app/periodicidades', permission: 'configuracion' },
  { divider: true, label: 'USUARIOS Y ROLES' },
  { text: 'Usuarios', icon: <PersonOutline />, path: '/app/usuarios', permission: 'usuarios' },
  { text: 'Roles', icon: <SupervisedUserCircle />, path: '/app/roles', permission: 'usuarios' },
  { text: 'Usuario-Roles', icon: <Link />, path: '/app/usuario-roles', permission: 'usuarios' },
  { divider: true },
  { text: 'Reportes', icon: <Assessment />, path: '/app/reportes', permission: 'reportes' },
  { text: 'Configuración', icon: <Settings />, path: '/app/configuracion' },
];

// Componente ScrollToTop
const ScrollTop = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Box
        onClick={scrollToTop}
        role="presentation"
        sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, roles } = useAuth();

  // Filtrar items del menú según permisos del usuario
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Siempre mostrar dividers y items sin permiso requerido
      if (item.divider || !item.permission) return true;
      // Verificar si tiene el permiso
      return hasPermission(item.permission);
    }).filter((item, index, arr) => {
      // Eliminar dividers consecutivos o al final
      if (item.divider) {
        const nextItem = arr[index + 1];
        if (!nextItem || nextItem.divider) return false;
      }
      return true;
    });
  }, [hasPermission]);

  // Obtener el rol principal del usuario
  const rolPrincipal = useMemo(() => {
    if (!roles || roles.length === 0) return null;
    // Prioridad: Administrador > Supervisor > Analista > Cobrador > Consulta
    const prioridad = ['Administrador', 'Supervisor', 'Analista', 'Cobrador', 'Consulta'];
    for (const rol of prioridad) {
      const encontrado = roles.find(r => r.nombre_rol === rol);
      if (encontrado) return encontrado;
    }
    return roles[0];
  }, [roles]);

  // Cerrar drawer al cambiar de tamaño de pantalla
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Obtener el título de la página actual
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => item.path === location.pathname);
    return currentItem?.text || 'Dashboard';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          py: 2,
          minHeight: { xs: 140, sm: 160 },
        }}
      >
        <Box
          component="img"
          src="/credi.png"
          alt="Logo"
          sx={{
            width: { xs: 60, sm: 80 },
            height: { xs: 60, sm: 80 },
            mb: 1,
            objectFit: 'contain',
          }}
        />
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Sistema de Cobros
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ py: 0 }}>
          {filteredMenuItems.map((item, index) =>
            item.divider ? (
              <Box key={`divider-${index}`}>
                <Divider sx={{ my: 0.5 }} />
                {item.label && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 0.5,
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 'bold',
                      fontSize: '0.65rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            ) : (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      minHeight: 44,
                      px: 2,
                      py: 0.75,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(0, 200, 83, 0.12)',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'rgba(0, 200, 83, 0.18)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          )}
        </List>
      </Box>
      {/* Footer del drawer con info del usuario en móvil */}
      {isMobile && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {user?.nombre?.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {user?.nombre} {user?.apellido}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.usuario}
                </Typography>
                {rolPrincipal && (
                  <Chip 
                    label={rolPrincipal.nombre_rol} 
                    size="small" 
                    color={
                      rolPrincipal.nombre_rol === 'Administrador' ? 'error' :
                      rolPrincipal.nombre_rol === 'Supervisor' ? 'warning' :
                      rolPrincipal.nombre_rol === 'Analista' ? 'info' :
                      rolPrincipal.nombre_rol === 'Cobrador' ? 'success' : 'default'
                    }
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
            aria-label="abrir menú"
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 500,
            }}
          >
            {getCurrentPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.nombre} {user?.apellido}
            </Typography>
            <IconButton 
              onClick={handleMenuOpen} 
              color="inherit"
              size={isSmall ? 'small' : 'medium'}
              aria-label="menú de usuario"
            >
              <Avatar 
                sx={{ 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 }, 
                  bgcolor: 'secondary.main',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {user?.nombre?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                '& .MuiMenuItem-root': {
                  py: 1.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight="medium">
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {user?.usuario}
              </Typography>
              {rolPrincipal && (
                <Chip 
                  label={rolPrincipal.nombre_rol} 
                  size="small" 
                  color={
                    rolPrincipal.nombre_rol === 'Administrador' ? 'error' :
                    rolPrincipal.nombre_rol === 'Supervisor' ? 'warning' :
                    rolPrincipal.nombre_rol === 'Analista' ? 'info' :
                    rolPrincipal.nombre_rol === 'Cobrador' ? 'success' : 'default'
                  }
                  sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
              {roles.length > 1 && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  +{roles.length - 1} rol(es) más
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/app/perfil'); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/app/configuracion'); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navegación principal"
      >
        {/* Drawer móvil con swipe */}
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: '85%', sm: drawerWidth },
              maxWidth: drawerWidth,
            },
          }}
          swipeAreaWidth={20}
          disableSwipeToOpen={false}
        >
          {drawer}
        </SwipeableDrawer>
        {/* Drawer desktop permanente */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ 
          maxWidth: '100%', 
          overflow: 'hidden',
          pb: { xs: 8, md: 2 }, // Espacio extra en móvil para FAB
        }}>
          <Outlet />
        </Box>
      </Box>

      {/* Botón scroll to top */}
      <ScrollTop>
        <Fab 
          color="primary" 
          size="small" 
          aria-label="volver arriba"
          sx={{
            boxShadow: 3,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </Box>
  );
};

export default Layout;
