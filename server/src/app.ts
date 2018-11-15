import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import uuidv4 from 'uuid/v4';
import helmet from 'helmet';
import cors from 'cors';
import { validate, ValidationError, validateSync } from 'class-validator';
import { Config }from './config/config';
import { loadConfig as apiLoadConfig, apiConfig } from './config/api';
import { loadConfig as dbLoadConfig, dbConfig }  from './config/db';
import { loadConfig as loggerLoadConfig, loggerConfig }  from './config/log';
import { errorNoRouteMapped, errorHandler } from './lib/errorhandler';
import logger from './lib/logger';
import Security from './lib/security';
import apiRouter from './routes/api';
import { Connection } from 'mongoose';

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
   * Build an application after configuration validation
   *
   * @static
   * @returns {(Promise<Application | undefined>)}
   * @memberof App
   */
  public static bootstrap(): Promise<Application> {
    return new Promise((resolve, reject) => {
      validateSync(apiLoadConfig);
      validateSync(appLoadConfig);
      validateSync(dbLoadConfig);
      validateSync(loggerLoadConfig);
      // Configuration validation
      Promise.all([
        validate(AppConfig.getConfig()),
        validate(DbConfig.getConfig()),
        validate(LoggerConfig.getConfig()),
      ])
        .then((validationResults: ValidationError[][]) => {
          // If at least 1 error has been found => rejects
          if (validationResults.some(result => result.length > 0)) return reject(new Error('Configuration validation failed, check previous log'));
          // All ok, resolves
          return resolve(new App().app);
        })
        .catch((err: Error) => reject(err));
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
    this.app.set('port', AppConfig.getConfig().port);
    // Connection to db
    DbConfig.getConfig().connect()
      .then((db: Connection) => this.app.set('db', db))
      .catch(/* istanbul ignore next */(err: Error) => process.exit(-1));
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
    this.app.use(cors(AppConfig.getConfig().corsConfiguration));
    // Body parser (to json) middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // Security initialization
    this.app.use(new Security().initialize());
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
    this.app.use(ApiConfig.getConfig().base, apiRouter);
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