import { config } from 'dotenv';
import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import uuidv4 from 'uuid/v4';
import helmet from 'helmet';
import cors from 'cors';
import appConfig from './config/app';
import apiConfig from './config/api';
import connect from './config/db';
import { errorNoRouteMapped, errorHandler } from './lib/errorhandler';
import logger from './lib/logger';
import { initialize } from './lib/security';
import apiRouter from './routes/api';
import { Connection } from 'mongoose';
import checkConfig from './lib/configurator';
import { rejects } from 'assert';

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
  public readonly app: Application;

  /**
   * Creates an instance of App.
   *
   * @memberof App
   */
  constructor() {
    // App creation
    this.app = express();
    // App configuration
    this.configuration();
    // Middlewares configuration
    this.middlewares();
    // Routes
    this.routes();
    // Error handlers
    this.errorHandlers();
  }

  /**
   * Build an applicatio after configuration validation
   *
   * @static
   * @returns {(Promise<Application | undefined>)}
   * @memberof App
   */
  public static bootstrap(): Promise<Application> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load of environment variables
        config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env-dev' });
        // Configuration validation
        await checkConfig();
        // Application creation
        return resolve(new App().app);
      } catch (err) {
        logger.fatal(`Error during application bootstrap: ${err}`);
        return reject(err);
      }
    });
  }

  /**
   * Configures app
   *
   * @private
   * @memberof App
   */
  private configuration(): void {
    // Port set
    this.app.set('port', appConfig.port);
    // Connection to db
    connect()
      .then((db: Connection) => this.app.set('db', db))
      .catch(/* istanbul ignore next */ (err: Error) => process.exit(-1));
  }

  /**
   * Adds all app middlewares
   *
   * @private
   * @memberof App
   */
  private middlewares(): void {
    // Logger middleware
    this.app.use(
      pino({
        logger,
        genReqId: () => uuidv4(),
      })
    );
    // Security middleware
    this.app.use(helmet());
    // CORS middleware
    this.app.use(cors(appConfig.corsConfiguration));
    // Body parser (to json) middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // Security initialization
    this.app.use(initialize());
    // Static files
    this.app.use(compression());
    // If production env, lets express server serve static resources
    if (process.env.SERVE_STATIC === 'true') this.app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

  /**
   * Registers all routes
   *
   * @private
   * @memberof App
   */
  private routes(): void {
    // Maps modules routes
    this.app.use(apiConfig.base, apiRouter);
  }

  /**
   * Adds default error handlers
   *
   * @private
   * @memberof App
   */
  private errorHandlers(): void {
    // Default error handlers
    this.app.use(errorNoRouteMapped);
    this.app.use(errorHandler);
  }
}