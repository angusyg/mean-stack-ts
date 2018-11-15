import { LevelWithSilent, LoggerOptions } from 'pino';
import { IsBoolean, IsIn } from 'class-validator';

/**
 * Logger global configuration
 *
 * @export
 * @class LoggerConfig
 */
export class LogConfig implements LoggerOptions {
  /**
   * Singleton instance
   *
   * @private
   * @static
   * @type {LogConfig}
   * @memberof LogConfig
   */
  private static instance: LogConfig;

  /**
   * Minimal log level
   *
   * @type {(Level | undefined)}
   * @memberof LogConfig
   */
  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  public readonly level: LevelWithSilent;

  /**
   * Enabled log
   *
   * @type {boolean}
   * @memberof LogConfig
   */
  @IsBoolean()
  public readonly enabled: boolean;

  private constructor() {
    this.level = <LevelWithSilent> process.env.LOG_LEVEL;
    this.enabled = process.env.LOG_ENABLED === '1' || process.env.LOG_ENABLED === 'true';
  }

  /**
   * Returns a singleton instance of LogConfig
   *
   * @static
   * @returns {LoggerOptions}
   * @memberof LogConfig
   */
  public static getConfig(): LogConfig {
    if (!LogConfig.instance) LogConfig.instance = new LogConfig();
    return LogConfig.instance;
  }
}
