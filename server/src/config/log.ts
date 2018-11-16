import convict = require("convict");

convict.addFormat({
  name: 'bool',
  validate: function(val) {
    console.log('ERRRRRROOOOOOOOOOOOOOOOOOOR', val)
    switch (val) {
      case true:
      case 'true':
      case 'TRUE':
      case 1:
      case '1':
      case 'on':
      case 'ON':
      case false:
      case 'false':
      case 'FALSE':
      case 0:
      case '0':
      case 'off':
      case 'OFF':
        return;
      default:
      console.log('ERRRRRROOOOOOOOOOOOOOOOOOOR')
        throw new TypeError(`must be in : true, 'true', 'TRUE', 1, '1', 'on', 'ON', false, 'false', 'FALSE', 0, '0', 'off', 'OFF'`);
    }
  },
  coerce: function(val) {
    switch (val) {
      case true:
      case 'true':
      case 'TRUE':
      case 1:
      case '1':
      case 'on':
      case 'ON':
        return true;
      default:
        return false;
    }
  },
});

export default {
  level: {
    doc: 'Logging minimal level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'debug',
    env: 'LOG_LEVEL',
  },
  enabled: {
    doc: 'Logging enabled flag',
    format: 'bool',
    env: 'LOG_ENABLED',
  },
};
