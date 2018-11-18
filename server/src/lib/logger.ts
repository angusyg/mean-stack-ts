import pino, { LoggerOptions, Level } from 'pino';
import moment from 'moment';
import os from 'os';
import Configuration from '../config/config';

export default class Logger {
  /**
   * Pino logger instance
   *
   * @static
   * @type {pino.Logger}
   * @memberof Logger
   */
  public static pino: pino.Logger;

  /**
   * Map of log level => number value
   *
   * @private
   * @static
   * @type {Map<string, Number>}
   * @memberof Logger
   */
  private static levels: Map<string, Number> = new Map([['trace', 10], ['debug', 20], ['info', 30], ['warn', 40], ['error', 50], ['fatal', 60]]);

  private constructor() {
    // Retrieves configuration for current environment
    const options: LoggerOptions = Configuration.get('log');
    Logger.pino = pino(options);
  }

  /**
   * Creates logger instance
   *
   * @static
   * @memberof Logger
   */
  public static create() {
    if (!Logger.pino) new Logger();
  }

  /**
   * Logs message to console if no logger instance, otherwise calls logger instance
   *
   * @static
   * @param {Level} level level of log
   * @param {string} message message to log
   * @memberof Logger
   */
  public static log(level: Level, message: string, data?: any): void {
    if (!Logger.pino) {
      // No pino logger, use of console
      // Construct object to format log
      const log = {
        level: Logger.levels.get(level),
        time: moment().valueOf(),
        msg: message,
        pid: process.pid,
        hostname: os.hostname(),
        caller: Logger.getCaller(),
        data: data ? (data instanceof Error ? data.stack : data) : undefined,
        v: 1,
      };
      console.log(JSON.stringify(log));
    } else {
      // Use of pino Logger
      const child = Logger.pino.child({
        caller: Logger.getCaller(),
        data: data ? (data instanceof Error ? data.stack : data) : undefined,
      });
      child[level](message);
    }
  }

  /**
   * Get logger caller file, line and column
   *
   * @private
   * @static
   * @returns {string} file:line:column
   * @memberof Logger
   */
  private static getCaller(): string {
    // If possible, extracts infos from stack
    let caller = '';
    const e = new Error();
    if (e.stack) {
      const call = /at (.*) \(.*\)/.exec(e.stack.split('\n')[4]);
      if (call) {
        // Extraction of file:line:column
        const line = /.* \(.*\\(.*)\)/.exec(call[0]);
        // Creation of log header
        if (line && line.length >= 1) caller = line[1];
      }
    }
    return caller;
  }

  /**
   * Logs a message with level debug
   *
   * @static
   * @param {string} message message to log
   * @memberof Logger
   */
  public static debug(message: string, data?: any): void {
    Logger.log('trace', message, data);
  }

  /**
   * Logs a message with level info
   *
   * @static
   * @param {string} message message to log
   * @memberof Logger
   */
  public static info(message: string, data?: any): void {
    Logger.log('info', message, data);
  }

  /**
   * Logs a message with level warn
   *
   * @static
   * @param {string} message message to log
   * @memberof Logger
   */
  public static warn(message: string, data?: any): void {
    Logger.log('warn', message, data);
  }

  /**
   * Logs a message with level error
   *
   * @static
   * @param {string} message message to log
   * @memberof Logger
   */
  public static error(message: string, data?: any): void {
    Logger.log('error', message, data);
  }

  /**
   * Logs a message with level fatal
   *
   * @static
   * @param {string} message message to log
   * @memberof Logger
   */
  public static fatal(message: string): void {
    Logger.log('fatal', message);
  }
}
