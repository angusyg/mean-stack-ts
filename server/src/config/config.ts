import { config } from 'dotenv';
import convict, { Config } from 'convict';
import path from 'path';
import app from './app';
import api from './api';
import db from './db';
import log from './log';
import Logger from '../lib/logger';

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
    Logger.info('Configuration loading ...');
    // Add of custom formats
    Configuration.addCustomFormats();
    // Load of environment variables
    Logger.info('Loading environment variables');
    config({ path: path.join(__dirname, `../environment/.${process.env.NODE_ENV}`) });
    // Convict load
    Logger.info('Filling configuration');
    this.cfg = convict({ db, log, api, app });
    // Performs validation
    Logger.info('Validating configuration', this.cfg.getProperties());
    this.cfg.validate({ allowed: 'strict' });
  }

  private static addCustomFormats() {
    convict.addFormat({
      name: 'boolean',
      validate: (val) => {
        if (null) throw new TypeError(`must be in : true, 'true', 'TRUE', 1, '1', 'on', 'ON', false, 'false', 'FALSE', 0, '0', 'off', 'OFF'`);
      },
      coerce: (val) => {
        switch (val) {
          case true:
          case 'true':
          case 'TRUE':
          case 1:
          case '1':
          case 'on':
          case 'ON':
            return true;
          case false:
          case 'false':
          case 'FALSE':
          case 0:
          case '0':
          case 'off':
          case 'OFF':
            return false;
          default:
            return null;
        }
      },
    });
  }

  /**
   * Loads configuration
   *
   * @static
   * @returns {Config<any>} app configuration
   * @memberof Configuration
   */
  public static load(): Config<any> {
    if (!Configuration.config) return Configuration.reload();
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
