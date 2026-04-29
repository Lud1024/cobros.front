// Utilidades de formateo para Guatemala

/**
 * Formatea un número como moneda guatemalteca (GTQ - Quetzales)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada (ej: Q 1,234.56)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Q 0.00';
  }
  
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('GTQ', 'Q');
};

/**
 * Formatea una fecha según el formato guatemalteco
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si se debe incluir la hora
 * @returns {string} - Fecha formateada (ej: 29/10/2025 o 29/10/2025 15:30)
 */
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const UTC_MIDNIGHT_RE = /^(\d{4})-(\d{2})-(\d{2})T00:00:00/;

const getDateInputParts = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }

  const localMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (localMatch) {
    return {
      year: Number(localMatch[3]),
      month: Number(localMatch[2]),
      day: Number(localMatch[1]),
    };
  }

  return null;
};

const isValidDateParts = (parts) => {
  if (!parts) return false;
  const { year, month, day } = parts;
  if (year < 1900 || year > 2100) return false;
  const parsed = new Date(year, month - 1, day, 12);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;
};

export const normalizeDateInput = (value) => {
  const parts = getDateInputParts(value);
  if (!isValidDateParts(parts)) return '';

  const year = String(parts.year).padStart(4, '0');
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateLocal = (date, includeTime = false) => {
  if (!date) return null;

  if (date instanceof Date) {
    if (!includeTime && date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0) {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12);
    }
    return date;
  }

  if (typeof date === 'string') {
    const normalizedInput = normalizeDateInput(date);
    if (normalizedInput) {
      const [, year, month, day] = normalizedInput.match(DATE_ONLY_RE);
      return new Date(Number(year), Number(month) - 1, Number(day), 12);
    }

    const utcMidnightMatch = date.match(UTC_MIDNIGHT_RE);
    if (utcMidnightMatch && !includeTime) {
      const [, year, month, day] = utcMidnightMatch;
      return new Date(Number(year), Number(month) - 1, Number(day), 12);
    }

    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match && !includeTime) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day), 12);
    }
  }

  return new Date(date);
};

export const isValidDateInput = (value) => {
  return Boolean(normalizeDateInput(value));
};

export const todayDateInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = parseDateLocal(date, includeTime);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Guatemala',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('es-GT', options).format(dateObj);
};

/**
 * Formatea una fecha para input de tipo date (yyyy-mm-dd)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha en formato yyyy-mm-dd
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = parseDateLocal(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado (ej: 1,234.56)
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} - Porcentaje formateado (ej: 15.5%)
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Formatea un teléfono guatemalteco
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado (ej: +502 1234-5678)
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato: +502 XXXX-XXXX (8 dígitos)
  if (cleaned.length === 8) {
    return `+502 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  // Si tiene código de país
  if (cleaned.length > 8) {
    const countryCode = cleaned.slice(0, -8);
    const number = cleaned.slice(-8);
    return `+${countryCode} ${number.slice(0, 4)}-${number.slice(4)}`;
  }
  
  return phone;
};

/**
 * Formatea un NIT guatemalteco
 * @param {string} nit - Número de NIT
 * @returns {string} - NIT formateado (ej: 1234567-8)
 */
export const formatNIT = (nit) => {
  if (!nit) return '';
  
  // Remover caracteres no numéricos excepto K
  const cleaned = nit.replace(/[^0-9K]/gi, '');
  
  // Formato: XXXXXXX-X
  if (cleaned.length >= 2) {
    const number = cleaned.slice(0, -1);
    const verifier = cleaned.slice(-1);
    return `${number}-${verifier}`;
  }
  
  return cleaned;
};

/**
 * Formatea un DPI guatemalteco
 * @param {string} dpi - Número de DPI
 * @returns {string} - DPI formateado (ej: 1234 12345 1234)
 */
export const formatDPI = (dpi) => {
  if (!dpi) return '';
  
  // Remover espacios y guiones
  const cleaned = dpi.replace(/[\s-]/g, '');
  
  // Formato: XXXX XXXXX XXXX (13 dígitos)
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 9)} ${cleaned.slice(9)}`;
  }
  
  return dpi;
};

/**
 * Valida si un string es un NIT guatemalteco válido
 * @param {string} nit - NIT a validar
 * @returns {boolean} - true si es válido
 */
export const isValidNIT = (nit) => {
  if (!nit) return false;
  
  const cleaned = nit.replace(/[^0-9K]/gi, '');
  
  if (cleaned.length < 2) return false;
  
  const number = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1).toUpperCase();
  
  // Algoritmo de validación de NIT
  let sum = 0;
  let factor = number.length + 1;
  
  for (let i = 0; i < number.length; i++) {
    sum += parseInt(number[i]) * factor;
    factor--;
  }
  
  const mod = sum % 11;
  const calculatedVerifier = mod === 0 ? 'K' : (11 - mod).toString();
  
  return verifier === calculatedVerifier;
};

/**
 * Obtiene el nombre del día en español
 * @param {number} dayIndex - Índice del día (0 = domingo)
 * @returns {string} - Nombre del día
 */
export const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex] || '';
};

/**
 * Obtiene el nombre del mes en español
 * @param {number} monthIndex - Índice del mes (0 = enero)
 * @returns {string} - Nombre del mes
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthIndex] || '';
};

/**
 * Convierte un string de moneda a número
 * @param {string} currencyString - String con formato de moneda
 * @returns {number} - Valor numérico
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  const cleaned = currencyString
    .replace(/[Q\s]/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleaned) || 0;
};
