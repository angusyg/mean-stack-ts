export default {
  level: {
    doc: 'Logging minimal level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'debug',
    env: 'LOG_LEVEL',
  },
  enabled: {
    doc: 'Logging enabled flag',
    format: Boolean,
    default: true,
    env: 'LOG_ENABLED',
  },
};