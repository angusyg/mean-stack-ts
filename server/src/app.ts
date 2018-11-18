import express, { Application } from 'express';
import path, { format } from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import uuidv4 from 'uuid/v4';
import helmet from 'helmet';
import cors from 'cors';
import Configuration from './config/config';
import logger from './lib/logger';
import { errorNoRouteMapped, errorHandler } from './lib/errorhandler';
import { getCorsConfiguration, initialize } from './lib/security';
import apiRouter from './routes/api';
import Logger from './lib/logger';

/**
 * Main application
 *
 * @class App
 */
export default class App {
  /**
   * Express application
   *
   * @type {Application}
   * @memberof App
   */
  private readonly app: Application;

  /**
   * Creates an instance of App.
   *
   * @param {Function} resolve
   * @param {Function} reject
   * @memberof App
   */
  private constructor(resolve: Function, reject: Function) {
    // App creation
    this.app = express();
    // App configuration
    this.configuration()
      .then(() => {
        // Middlewares configuration
        this.middlewares();
        // Routes
        this.routes();
        // Error handlers
        this.errorHandlers();
        resolve(this.app);
      })
      .catch((err: Error) => {
        reject(err);
      });
  }

  /**
   * Bootstraps application
   *
   * @static
   * @returns {Promise<Application>} express application created
   * @memberof App
   */
  public static bootstrap(): Promise<Application> {
    return new Promise(async (resolve, reject) => {
      try {
        Logger.info('Bootstraping express application');
        // Creates application passing promise callback
        return new App(resolve, reject);
      } catch (err) {
        return reject(err);
      }
    })
  }

  /**
   * Configures app
   *
   * @private
   * @memberof App
   */
  private configuration(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        Logger.debug('Configuring express application');
        // Port set
        this.app.set('port', Configuration.get('app.port'));
        // Connection to db
        Logger.info('Connecting database', Configuration.get('db'));
        const connection = await mongoose.connect(`mongodb://${Configuration.get('db.host')}/${Configuration.get('db.name')}`, { useNewUrlParser: true });
        logger.info(`Connection opened to DB 'mongodb://${Configuration.get('db.host')}/${Configuration.get('db.name')}'`);
        // Database registration
        this.app.set('db', mongoose.connection);
        Logger.debug('Express application configured');
        return resolve();
      } catch (err) {
        logger.error('Error application configuration', err);
        return reject(err);
      }
    });
  }

  /**
   * Adds all app middlewares
   *
   * @private
   * @memberof App
   */
  private middlewares(): void {
    Logger.debug('Adding middlewares to express application');
    // Logger middleware
    this.app.use(
      pino({
        logger: logger.pino,
        genReqId: () => uuidv4(),
      })
    );
    // Security middleware
    this.app.use(helmet());
    // CORS middleware
    this.app.use(cors(getCorsConfiguration()));
    // Body parser (to json) middleware
    this.app.use(bodyParser.json());
    // Put in body URL encoded parameters
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // Security initialization
    this.app.use(initialize());
    // Static files
    this.app.use(compression());
    // If production env, lets express server serve static resources
    if (Configuration.get('app.serve')) {
      Logger.info('Express application static content enabled');
      this.app.use(express.static(path.join(__dirname, '../../client/dist')));
    }
    Logger.debug('Middlewares added to express application');
  }

  /**
   * Registers all routes
   *
   * @private
   * @memberof App
   */
  private routes(): void {
    Logger.debug('Adding routes to express application');
    // Maps modules routes
    this.app.use(Configuration.get('api.base'), apiRouter);
    Logger.debug('Routes added to express application');
  }

  /**
   * Adds default error handlers
   *
   * @private
   * @memberof App
   */
  private errorHandlers(): void {
    Logger.debug('Adding error handlers to express application');
    // Default error handlers
    this.app.use(errorNoRouteMapped);
    this.app.use(errorHandler);
    Logger.debug('Error handlers added to express application');
  }
}
