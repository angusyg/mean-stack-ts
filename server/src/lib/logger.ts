import pino, { LoggerOptions } from 'pino';
import pinoCaller from 'pino-caller';
import LoggerConfig from '../config/logger';

// Retrieves configuration for current environment
const options: LoggerOptions = LoggerConfig.getConfig();

export default process.env.NODE_ENV === 'production' ? pino(options) : pinoCaller(pino(options));
