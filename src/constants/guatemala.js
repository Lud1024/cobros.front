// Constantes de configuración para Guatemala

export const COUNTRY = 'Guatemala';
export const COUNTRY_CODE = 'GT';
export const CURRENCY = 'GTQ';
export const CURRENCY_SYMBOL = 'Q';
export const TIMEZONE = 'America/Guatemala';
export const LOCALE = 'es-GT';

// Departamentos de Guatemala
export const DEPARTMENTS = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
];

// Bancos de Guatemala
export const BANKS = [
  'Banco Industrial',
  'Banco G&T Continental',
  'Banco de Desarrollo Rural (Banrural)',
  'Banco Agromercantil (BAM)',
  'Banco Promerica',
  'Banco Inmobiliario',
  'Banco Internacional',
  'Banco Azteca',
  'Banco Ficohsa',
  'Banco Crédito Hipotecario Nacional (CHN)',
  'Vivibanco',
  'Banco de Antigua',
];

// Tipos de documento de identificación
export const ID_TYPES = [
  { value: 'DPI', label: 'DPI (Documento Personal de Identificación)' },
  { value: 'NIT', label: 'NIT (Número de Identificación Tributaria)' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'LICENCIA', label: 'Licencia de Conducir' },
];

// Estados civiles
export const MARITAL_STATUS = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Unión de Hecho',
];

// Niveles educativos
export const EDUCATION_LEVELS = [
  'Sin Educación Formal',
  'Primaria Incompleta',
  'Primaria Completa',
  'Básicos Incompleta',
  'Básicos Completa',
  'Diversificado Incompleto',
  'Diversificado Completo',
  'Universidad Incompleta',
  'Universidad Completa',
  'Postgrado',
];

// Tipos de vivienda
export const HOUSING_TYPES = [
  'Propia',
  'Alquilada',
  'Familiar',
  'Prestada',
  'Otro',
];

// Tipos de trabajo
export const JOB_TYPES = [
  'Empleado Formal',
  'Empleado Informal',
  'Negocio Propio',
  'Independiente',
  'Jubilado/Pensionado',
  'Estudiante',
  'Ama de Casa',
  'Desempleado',
  'Otro',
];

// Frecuencias de pago
export const PAYMENT_FREQUENCIES = [
  { value: 'DIARIO', label: 'Diario' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'QUINCENAL', label: 'Quincenal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'BIMENSUAL', label: 'Bimensual' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
];

// Métodos de pago
export const PAYMENT_METHODS = [
  'Efectivo',
  'Transferencia Bancaria',
  'Depósito Bancario',
  'Cheque',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'Billetera Digital',
];

// Estados de préstamo
export const LOAN_STATUS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#fbbc04' },
  { value: 'APROBADO', label: 'Aprobado', color: '#34a853' },
  { value: 'ACTIVO', label: 'Activo', color: '#1a73e8' },
  { value: 'EN_MORA', label: 'En Mora', color: '#ea4335' },
  { value: 'PAGADO', label: 'Pagado', color: '#34a853' },
  { value: 'CANCELADO', label: 'Cancelado', color: '#5f6368' },
  { value: 'RECHAZADO', label: 'Rechazado', color: '#ea4335' },
];

// Estados de cuota
export const INSTALLMENT_STATUS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#fbbc04' },
  { value: 'PAGADA', label: 'Pagada', color: '#34a853' },
  { value: 'VENCIDA', label: 'Vencida', color: '#ea4335' },
  { value: 'PARCIAL', label: 'Pago Parcial', color: '#ff9800' },
];

// Tipos de garantía
export const COLLATERAL_TYPES = [
  'Vehículo',
  'Inmueble',
  'Maquinaria',
  'Mercadería',
  'Fiador Solidario',
  'Prenda',
  'Hipoteca',
  'Electrodomésticos',
  'Joyas',
  'Otro',
];

// Niveles de riesgo
export const RISK_LEVELS = [
  { value: 'BAJO', label: 'Bajo', color: '#34a853' },
  { value: 'MEDIO', label: 'Medio', color: '#fbbc04' },
  { value: 'ALTO', label: 'Alto', color: '#ea4335' },
];

// Configuración de sesión
export const SESSION_DURATION = '1 hora';
export const SESSION_WARNING_TIME = 5; // minutos antes de expirar

// Formato de moneda
export const CURRENCY_CONFIG = {
  symbol: CURRENCY_SYMBOL,
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: true,
};

// Formato de fecha
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Validaciones
export const VALIDATION_RULES = {
  DPI_LENGTH: 13,
  NIT_MIN_LENGTH: 8,
  NIT_MAX_LENGTH: 9,
  PHONE_LENGTH: 8,
  PASSWORD_MIN_LENGTH: 8,
  MIN_AGE: 18,
  MAX_AGE: 100,
};

// Mensajes del sistema
export const MESSAGES = {
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  SESSION_WARNING: `Tu sesión expirará en ${SESSION_WARNING_TIME} minutos.`,
  SAVE_SUCCESS: 'Datos guardados correctamente.',
  UPDATE_SUCCESS: 'Datos actualizados correctamente.',
  DELETE_SUCCESS: 'Registro eliminado correctamente.',
  DELETE_CONFIRM: '¿Estás seguro de que deseas eliminar este registro?',
  GENERIC_ERROR: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  INVALID_EMAIL: 'Correo electrónico inválido.',
  INVALID_PHONE: 'Número de teléfono inválido (debe tener 8 dígitos).',
  INVALID_DPI: 'DPI inválido (debe tener 13 dígitos).',
  INVALID_NIT: 'NIT inválido.',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
  WEAK_PASSWORD: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.',
};

export default {
  COUNTRY,
  COUNTRY_CODE,
  CURRENCY,
  CURRENCY_SYMBOL,
  TIMEZONE,
  LOCALE,
  DEPARTMENTS,
  BANKS,
  ID_TYPES,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  HOUSING_TYPES,
  JOB_TYPES,
  PAYMENT_FREQUENCIES,
  PAYMENT_METHODS,
  LOAN_STATUS,
  INSTALLMENT_STATUS,
  COLLATERAL_TYPES,
  RISK_LEVELS,
  SESSION_DURATION,
  SESSION_WARNING_TIME,
  CURRENCY_CONFIG,
  DATE_FORMAT,
  DATETIME_FORMAT,
  TIME_FORMAT,
  VALIDATION_RULES,
  MESSAGES,
};
