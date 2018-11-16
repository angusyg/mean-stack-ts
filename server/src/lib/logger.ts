import pino, { LoggerOptions } from 'pino';
import pinoCaller from 'pino-caller';
import Configuration from '../config/config';

// Retrieves configuration for current environment
const options: LoggerOptions = Configuration.get('log');

export default process.env.NODE_ENV === 'production' ? pino(options) : pinoCaller(pino(options));
