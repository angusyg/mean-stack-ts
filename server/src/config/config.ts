import { config } from 'dotenv';
import { ApiConfig } from './api';
import { AppConfig } from './app';
import { DbConfig } from './db';
import { LogConfig } from './log';

export class Config {
  /**
   * Global configuration instance
   *
   * @private
   * @static
   * @type {Config}
   * @memberof Config
   */
  private static instance: Config;

  /**
   * Api configuration instance
   *
   * @private
   * @type {ApiConfig}
   * @memberof Config
   */
  private api: ApiConfig;

  /**
   * App configuration instance
   *
   * @private
   * @type {AppConfig}
   * @memberof Config
   */
  private app: AppConfig;

  /**
   * Database configurationb instance
   *
   * @private
   * @type {DbConfig}
   * @memberof Config
   */
  private db: DbConfig;

  /**
   * Log configuration instance
   *
   * @private
   * @type {LogConfig}
   * @memberof Config
   */
  private log: LogConfig;

  constructor() {
    // Load of environment variables
    const result = config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env-dev' });
    if (result.error) throw result.error;
    else console.log(result.parsed);

    // Load of all configurations
    this.api = ApiConfig.getConfig();
    this.app = AppConfig.getConfig();
    this.db = DbConfig.getConfig();
    this.log = LogConfig.getConfig();
  }

  /**
   * Returns a singleton instance of Config
   *
   * @static
   * @returns {Config} singleton instance of Config
   * @memberof Config
   */
  public static load(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }
}