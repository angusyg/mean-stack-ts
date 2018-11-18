#!/usr/bin/env node
import http from 'http';
import Configuration from '../config/config';
import App from '../app';
import { Application } from 'express';
import Logger from '../lib/logger';

/**
 * Application Server class
 *
 * @class AppServer
 */
class AppServer {
  /**
   * Server port
   *
   * @private
   * @static
   * @type {number | string | boolean}
   * @memberof AppServer
   */
  private static port: any;

  /**
   * Application associated to Server
   *
   * @private
   * @static
   * @type {Application}
   * @memberof AppServer
   */
  private static app: any;

  /**
   * HTTP Server
   *
   * @private
   * @static
   * @type {http.Server}
   * @memberof AppServer
   */
  private static server: any;

  constructor() {
    Logger.info('Server loading ...');
    // Load of configuration
    Configuration.load();
    // logger creation
    Logger.create();
    // Application creation
    App.bootstrap()
      .then((app: Application) => {
        AppServer.app = app;
        // Gets port from app
        AppServer.port = this.normalizePort(AppServer.app.get('port'));
        // Creates HTTP server
        AppServer.server = http.createServer(AppServer.app);
        // Listens on provided port, on all network interfaces
        AppServer.server.listen(AppServer.port, () => {
          Logger.info(`Server started, listening on ${AppServer.port}`);
          // For tests
          AppServer.app.emit('appStarted');
          // For pm2
          if (process.env.PM2) (<any>process).send('ready');
        });
        // Catches server errors
        AppServer.server.on('error', this.onError);
        // Catches signals to gracefully quit
        process.on('SIGTERM', this.gracefulShutdown);
        process.on('SIGINT', this.gracefulShutdown);
      })
      .catch((err: Error) => {
        Logger.error(`Error during server creation`, err);
        // Shutdown of application server
        this.gracefulShutdown();
      });
  }

  /**
   * Event listener for HTTP server "error" event.
   *
   * @private
   * @param {NodeJS.ErrnoException} error error to handle
   * @memberof AppServer
   */
  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    const bind = AppServer.port === 'string' ? `Pipe ${AppServer.port}` : `Port ${AppServer.port}`;
    // Handles specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        Logger.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        Logger.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Normalizes a port into a number, string, or false.
   *
   * @private
   * @param {(string | number)} val port value
   * @returns {(number | string | boolean)} port normalized value
   * @memberof AppServer
   */
  private normalizePort(val: string | number): number | string | boolean {
    let port: number = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
  }

  /**
   * Gracefully closes application server, waiting for opened
   *
   * @private
   * @memberof AppServer
   */
  private gracefulShutdown(): void {
    Logger.info('Closing application server ...');
    // Database close if opened
    if (AppServer.app.get('db')) {
      Logger.info('Closing Database connection ...');
      // Closes DB connection
      AppServer.app.get('db').close();
      Logger.info('Database connection closed');
    }
    // Server close if started
    if (AppServer.server) {
      AppServer.server.close(() => {
        Logger.info('Application server closed');
        process.exit(0);
      });
    }
    // Forces close server after 5secs
    setTimeout(e => {
      Logger.warn('Application server forced to close');
      process.exit(1);
    }, 5000);
  }
}

export default new AppServer();
