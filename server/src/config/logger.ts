import { LevelWithSilent, LoggerOptions } from 'pino';
import { IsBoolean, IsIn } from 'class-validator';

/**
 * Logger global configuration
 *
 * @export
 * @class LoggerConfig
 */
export class LoggerConfig implements LoggerOptions {
  /**
   * Singleton instance
   *
   * @private
   * @static
   * @type {LoggerConfig}
   * @memberof LoggerConfig
   */
  private static instance: LoggerOptions;

  /**
   * Minimal log level
   *
   * @type {(Level | undefined)}
   * @memberof LoggerConfig
   */
  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  public readonly level: LevelWithSilent;

  /**
   * Enabled log
   *
   * @type {boolean}
   * @memberof LoggerConfig
   */
  @IsBoolean()
  public readonly enabled: boolean;

  private constructor() {
    this.level = <LevelWithSilent> process.env.LOG_LEVEL;
    this.enabled = process.env.LOG_ENABLED === '1' || process.env.LOG_ENABLED === 'true';
  }

  /**
   * Returns a singleton instance of LoggerConfig
   *
   * @static
   * @returns {LoggerOptions}
   * @memberof LoggerConfig
   */
  public static getConfig(): LoggerOptions {
    if (!LoggerConfig.instance) LoggerConfig.instance = new LoggerConfig();
    return LoggerConfig.instance;
  }
}
