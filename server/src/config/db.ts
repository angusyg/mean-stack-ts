import mongoose from 'mongoose';
import logger from '../lib/logger';


/**
 * Database global configuration
 *
 * @export
 * @class DbConfig
 */
export default class DbConfig {
  /**
   * Singleton instance
   *
   * @private
   * @static
   * @type {DbConfig}
   * @memberof DbConfig
   */
  private static instance: DbConfig;

  /**
   * Database server URL
   *
   * @private
   * @type {(string | undefined)}
   * @memberof DbConfig
   */
  private server: string | undefined;

  /**
   * Database name
   *
   * @private
   * @type {(string | undefined)}
   * @memberof DbConfig
   */
  private database: string | undefined;

  private constructor() {
    this.server = process.env.DB_URL;
    this.database = process.env.DB_NAME;
    // Overrides mongoose default promise with es6 Promise (to get full support)
    mongoose.Promise = Promise;
  }

  /**
   * Returns a singleton instance of DbConfig
   *
   * @static
   * @returns {DbConfig}
   * @memberof DbConfig
   */
  public static getConfig(): DbConfig {
    if (!DbConfig.instance) DbConfig.instance = new DbConfig();
    return DbConfig.instance;
  }

  /**
   * Connects app to MongoDB database
   *
   * @returns {Promise<mongoose.Connection>}
   * @memberof DbConfig
   */
  public connect(): Promise<mongoose.Connection> {
    return new Promise((resolve, reject) => {
      mongoose
        .connect(`mongodb://${this.server}/${this.database}`, { useNewUrlParser: true })
        .then(() => {
          logger.info(`Connection opened to DB 'mongodb://${this.server}/${this.database}'`);
          resolve(mongoose.connection);
        })
        .catch(/* istanbul ignore next */(err: Error) => {
          logger.fatal(`Error during DB connection : ${err}`);
          reject(err);
        });
    });
  }
}
