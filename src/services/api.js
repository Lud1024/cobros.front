import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración de timeout y reintentos
const TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 2;

// Instancia de Axios configurada
const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para reintentar peticiones fallidas
const retryRequest = async (config, retries = MAX_RETRIES) => {
  try {
    return await api.request(config);
  } catch (error) {
    if (retries > 0 && error.code === 'ECONNABORTED') {
      logger.warn(`Reintentando petición (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
};

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request in dev
    logger.debug('API Request', logger.mask({ method: config.method, url: config.url, data: config.data }));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Do not auto-redirect on failed login/register attempts
    const isAuthEndpoint = url && (url.endsWith('/auth/login') || url.endsWith('/auth/register'));
    
    // Manejo específico de errores
    if (!error.response) {
      // Error de red/conexión
      logger.error('Network Error', error.message);
      error.userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if ((status === 401 || status === 403) && !isAuthEndpoint) {
      // Token expirado o inválido - redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Emitir evento personalizado para mostrar dialog de Material-UI
      const mensaje = 'TOKEN INVALIDO';
      window.dispatchEvent(new CustomEvent('token-invalid', { detail: { mensaje } }));
      
      // Esperar un momento para que se muestre el dialog antes de redirigir
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      error.userMessage = mensaje;
    } else if (status === 404) {
      error.userMessage = 'El recurso solicitado no existe.';
    } else if (status === 422) {
      error.userMessage = error.response?.data?.error || 'Datos inválidos.';
    } else if (status >= 500) {
      error.userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
    }
    
    // Log error
    logger.error('API Response Error', error.response?.status, logger.mask(error.response?.data));
    return Promise.reject(error);
  }
);

// Helper para obtener mensaje de error user-friendly
export const getErrorMessage = (error) => {
  return error.userMessage || 
         error.response?.data?.error || 
         error.response?.data?.message || 
         error.message || 
         'Ha ocurrido un error inesperado';
};

// ============= AUTH SERVICES =============
export const authService = {
  login: async (usuario, password) => {
    const response = await api.post('/auth/login', { usuario, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    logger.info('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// ============= CLIENTES SERVICES =============
export const clientesService = {
  getAll: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  create: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  update: async (id, clienteData) => {
    const response = await api.patch(`/clientes/${id}`, clienteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};

// ============= PRESTAMOS SERVICES =============
export const prestamosService = {
  getAll: async () => {
    const response = await api.get('/prestamos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/prestamos/${id}`);
    return response.data;
  },

  getByCliente: async (idCliente) => {
    const response = await api.get(`/prestamos/cliente/${idCliente}`);
    return response.data;
  },

  create: async (prestamoData) => {
    const response = await api.post('/prestamos', prestamoData);
    return response.data;
  },

  update: async (id, prestamoData) => {
    const response = await api.patch(`/prestamos/${id}`, prestamoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/prestamos/${id}`);
    return response.data;
  },
};

// ============= PAGOS SERVICES =============
export const pagosService = {
  getAll: async () => {
    const response = await api.get('/pagos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData);
    return response.data;
  },

  update: async (id, pagoData) => {
    const response = await api.patch(`/pagos/${id}`, pagoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  },
};

// ============= CUOTAS SERVICES =============
export const cuotasService = {
  getAll: async () => {
    const response = await api.get('/cuotas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cuotas/${id}`);
    return response.data;
  },

  getByPrestamo: async (idPrestamo) => {
    const response = await api.get(`/cuotas/prestamo/${idPrestamo}`);
    return response.data;
  },

  update: async (id, cuotaData) => {
    const response = await api.patch(`/cuotas/${id}`, cuotaData);
    return response.data;
  },
};

// ============= CARTERAS SERVICES =============
export const carterasService = {
  getAll: async () => {
    const response = await api.get('/carteras');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/carteras/${id}`);
    return response.data;
  },

  create: async (carteraData) => {
    const response = await api.post('/carteras', carteraData);
    return response.data;
  },

  update: async (id, carteraData) => {
    const response = await api.patch(`/carteras/${id}`, carteraData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/carteras/${id}`);
    return response.data;
  },
};

// ============= USUARIOS SERVICES =============
export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (usuarioData) => {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },

  update: async (id, usuarioData) => {
    const response = await api.patch(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

// ============= ROLES SERVICES =============
export const rolesService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  create: async (rolData) => {
    const response = await api.post('/roles', rolData);
    return response.data;
  },

  update: async (id, rolData) => {
    const response = await api.patch(`/roles/${id}`, rolData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

// ============= PERIODICIDADES SERVICES =============
export const periodicidadesService = {
  getAll: async () => {
    const response = await api.get('/periodicidades');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/periodicidades/${id}`);
    return response.data;
  },

  create: async (periodicidadData) => {
    const response = await api.post('/periodicidades', periodicidadData);
    return response.data;
  },

  update: async (id, periodicidadData) => {
    const response = await api.patch(`/periodicidades/${id}`, periodicidadData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/periodicidades/${id}`);
    return response.data;
  },
};

// ============= VISITAS COBRO SERVICES =============
export const visitasCobroService = {
  getAll: async () => {
    const response = await api.get('/visitas-cobro');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/visitas-cobro/${id}`);
    return response.data;
  },

  create: async (visitaData) => {
    const response = await api.post('/visitas-cobro', visitaData);
    return response.data;
  },

  update: async (id, visitaData) => {
    const response = await api.patch(`/visitas-cobro/${id}`, visitaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/visitas-cobro/${id}`);
    return response.data;
  },
};

// ============= METODOS GARANTIA SERVICES =============
export const metodosGarantiaService = {
  getAll: async () => {
    const response = await api.get('/metodos-garantia');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/metodos-garantia/${id}`);
    return response.data;
  },

  create: async (metodoData) => {
    const response = await api.post('/metodos-garantia', metodoData);
    return response.data;
  },

  update: async (id, metodoData) => {
    const response = await api.patch(`/metodos-garantia/${id}`, metodoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/metodos-garantia/${id}`);
    return response.data;
  },
};

// ============= POLITICAS MORA SERVICES =============
export const politicasMoraService = {
  getAll: async () => {
    const response = await api.get('/politicas-mora');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/politicas-mora/${id}`);
    return response.data;
  },

  create: async (politicaData) => {
    const response = await api.post('/politicas-mora', politicaData);
    return response.data;
  },

  update: async (id, politicaData) => {
    const response = await api.patch(`/politicas-mora/${id}`, politicaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/politicas-mora/${id}`);
    return response.data;
  },
};

// ============= PRESTAMO GARANTIA SERVICES =============
export const prestamoGarantiaService = {
  getAll: async () => {
    const response = await api.get('/prestamo-garantia');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/prestamo-garantia/${id}`);
    return response.data;
  },

  getByPrestamo: async (idPrestamo) => {
    const response = await api.get(`/prestamo-garantia/prestamo/${idPrestamo}`);
    return response.data;
  },

  create: async (garantiaData) => {
    const response = await api.post('/prestamo-garantia', garantiaData);
    return response.data;
  },

  update: async (id, garantiaData) => {
    const response = await api.patch(`/prestamo-garantia/${id}`, garantiaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/prestamo-garantia/${id}`);
    return response.data;
  },
};

// ============= VERIFICACIONES PRESTAMO SERVICES =============
export const verificacionesPrestamoService = {
  getAll: async () => {
    const response = await api.get('/verificaciones-prestamo');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/verificaciones-prestamo/${id}`);
    return response.data;
  },

  create: async (verificacionData) => {
    const response = await api.post('/verificaciones-prestamo', verificacionData);
    return response.data;
  },

  update: async (id, verificacionData) => {
    const response = await api.patch(`/verificaciones-prestamo/${id}`, verificacionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/verificaciones-prestamo/${id}`);
    return response.data;
  },
};

// ============= MORA EVENTOS SERVICES =============
export const moraEventosService = {
  getAll: async () => {
    const response = await api.get('/mora-eventos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/mora-eventos/${id}`);
    return response.data;
  },

  create: async (eventoData) => {
    const response = await api.post('/mora-eventos', eventoData);
    return response.data;
  },

  update: async (id, eventoData) => {
    const response = await api.patch(`/mora-eventos/${id}`, eventoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/mora-eventos/${id}`);
    return response.data;
  },
};

// ============= CLIENTE DOCUMENTOS SERVICES =============
export const clienteDocumentosService = {
  getAll: async () => {
    const response = await api.get('/cliente-documentos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cliente-documentos/${id}`);
    return response.data;
  },

  getByCliente: async (idCliente) => {
    const response = await api.get(`/cliente-documentos/cliente/${idCliente}`);
    return response.data;
  },

  create: async (documentoData) => {
    const response = await api.post('/cliente-documentos', documentoData);
    return response.data;
  },

  update: async (id, documentoData) => {
    const response = await api.patch(`/cliente-documentos/${id}`, documentoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cliente-documentos/${id}`);
    return response.data;
  },
};

// ============= RECHAZOS HISTORIAL SERVICES =============
export const rechazosHistorialService = {
  getAll: async () => {
    const response = await api.get('/rechazos-historial');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/rechazos-historial/${id}`);
    return response.data;
  },

  create: async (rechazoData) => {
    const response = await api.post('/rechazos-historial', rechazoData);
    return response.data;
  },

  update: async (id, rechazoData) => {
    const response = await api.patch(`/rechazos-historial/${id}`, rechazoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/rechazos-historial/${id}`);
    return response.data;
  },
};

// ============= PAGO APLICACIONES SERVICES =============
export const pagoAplicacionesService = {
  getAll: async () => {
    const response = await api.get('/pago-aplicaciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pago-aplicaciones/${id}`);
    return response.data;
  },

  create: async (aplicacionData) => {
    const response = await api.post('/pago-aplicaciones', aplicacionData);
    return response.data;
  },

  update: async (id, aplicacionData) => {
    const response = await api.patch(`/pago-aplicaciones/${id}`, aplicacionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pago-aplicaciones/${id}`);
    return response.data;
  },
};

// ============= ROL CARTERA SERVICES =============
export const rolCarteraService = {
  getAll: async () => {
    const response = await api.get('/rol-cartera');
    return response.data;
  },

  getCarterasByRol: async (idRol) => {
    const response = await api.get(`/rol-cartera/rol/${idRol}`);
    return response.data;
  },

  getRolesByCartera: async (idCartera) => {
    const response = await api.get(`/rol-cartera/cartera/${idCartera}`);
    return response.data;
  },

  create: async (rolCarteraData) => {
    const response = await api.post('/rol-cartera', rolCarteraData);
    return response.data;
  },

  delete: async (idRol, idCartera) => {
    const response = await api.delete(`/rol-cartera/${idRol}/${idCartera}`);
    return response.data;
  },
};

// ============= USUARIO ROLES SERVICES =============
export const usuarioRolesService = {
  getAll: async () => {
    const response = await api.get('/usuario-roles');
    return response.data;
  },

  getRolesByUsuario: async (idUsuario) => {
    const response = await api.get(`/usuario-roles/usuario/${idUsuario}`);
    return response.data;
  },

  create: async (usuarioRolData) => {
    const response = await api.post('/usuario-roles', usuarioRolData);
    return response.data;
  },

  delete: async (idUsuario, idRol, idCartera) => {
    const response = await api.delete(`/usuario-roles/${idUsuario}/${idRol}/${idCartera}`);
    return response.data;
  },
};

export default api;
