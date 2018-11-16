import { config } from 'dotenv';
import convict, { Config } from 'convict';
import path from 'path';
import app from './app';
import api from './api';
import db from './db';
import log from './log';

export default class Configuration {
  /**
   * Singleton instance
   *
   * @private
   * @static
   * @type {Configuration}
   * @memberof Configuration
   */
  private static config: Configuration;

  /**
   * Loaded configuration values
   *
   * @private
   * @type {Config<any>}
   * @memberof Configuration
   */
  private cfg: Config<any>;

  private constructor() {
    config({ path: path.join(__dirname, `../environment/.${process.env.NODE_ENV}`) });
    // Convict load
    this.cfg = convict({ db, log, api, app });
    // Perform validation
    this.cfg.validate({ allowed: 'strict' });
  }

  /**
   * Loads configuration
   *
   * @static
   * @returns {Config<any>} app configuration
   * @memberof Configuration
   */
  public static load(): Config<any> {
    if (!Configuration.config) Configuration.config = new Configuration();
    return Configuration.config.cfg;
  }

  /**
   * Reloads configuration
   *
   * @static
   * @returns {Config<any>} app configuration
   * @memberof Configuration
   */
  public static reload(): Config<any> {
    Configuration.config = new Configuration();
    return Configuration.config.cfg;
  }

  /**
   * Retrieves a value from configuration with its key
   *
   * @static
   * @param {string} key key of property to retrieve
   * @returns {any} property value
   * @memberof Configuration
   */
  public static get(key: string): any {
    // Load configuration and returns value of key
    return Configuration.load().get(key);
  }
}