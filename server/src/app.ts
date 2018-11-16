import express, { Application } from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import uuidv4 from 'uuid/v4';
import helmet from 'helmet';
import cors from 'cors';
import Configuration from './config/config';
import { errorNoRouteMapped, errorHandler } from './lib/errorhandler';
import logger from './lib/logger';
import { getCorsConfiguration, initialize } from './lib/security';
import apiRouter from './routes/api';

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
    this.configuration()
      .then(() => {
        // Middlewares configuration
        this.middlewares();
        // Routes
        this.routes();
        // Error handlers
        this.errorHandlers();
      })
      .catch((err: Error) => {
        throw err;
      });
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
        // Port set
        this.app.set('port', Configuration.get('app.port'));
        // Connection to db
        const connection = await mongoose.connect(`mongodb://${Configuration.get('db.host')}/${Configuration.get('db.name')}`, { useNewUrlParser: true });
        console.info(`Connection opened to DB 'mongodb://${Configuration.get('db.host')}/${Configuration.get('db.name')}'`);
        // Database registration
        this.app.set('db', mongoose.connection);
        return resolve();
      } catch (err) {
        console.error(`Error during DB connection: ${err}`);
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
    if (Configuration.get('app.serve')) this.app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

  /**
   * Registers all routes
   *
   * @private
   * @memberof App
   */
  private routes(): void {
    // Maps modules routes
    this.app.use(Configuration.get('api.base'), apiRouter);
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
