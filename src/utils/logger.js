const ENABLE_LOGS = import.meta.env.VITE_ENABLE_LOGS === 'true';

function maskSensitive(obj) {
  try {
    const cloned = JSON.parse(JSON.stringify(obj));
    if (cloned && cloned.data && cloned.data.password) cloned.data.password = '***';
    if (cloned && cloned.password) cloned.password = '***';
    return cloned;
  } catch (e) {
    return obj;
  }
}

export default {
  debug: (...args) => {
    if (ENABLE_LOGS) console.debug('[DEBUG]', new Date().toISOString(), ...args);
  },
  info: (...args) => {
    if (ENABLE_LOGS) console.info('[INFO]', new Date().toISOString(), ...args);
  },
  warn: (...args) => {
    if (ENABLE_LOGS) console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  error: (...args) => {
    if (ENABLE_LOGS) console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  mask: maskSensitive,
};
