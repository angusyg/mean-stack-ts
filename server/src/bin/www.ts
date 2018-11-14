#!/usr/bin/env node
import { config } from 'dotenv';
import http from 'http';
import { Application } from 'express';
import App from '../app';

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
   * @type {number | string | boolean}
   * @memberof AppServer
   */
  private port: any;

  /**
   * Application associated to Server
   *
   * @private
   * @type {Application}
   * @memberof AppServer
   */
  private app: any;

  /**
   * HTTP Server
   *
   * @private
   * @type {http.Server}
   * @memberof AppServer
   */
  private server: any;

  constructor() {
    // Load of environment variables
    config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env-dev' });
    console.log('BOOTSTRAP');
    App.bootstrap()
      .then((app: Application) => {
        this.app = app;
        // Gets port from app
        this.port = this.normalizePort(this.app.get('port'));
        // Creates HTTP server
        this.server = http.createServer(this.app);
        // Listens on provided port, on all network interfaces
        this.server.listen(this.port, () => {
          console.info(`Server started, listening on ${this.port}`);
          // For tests
          this.app.emit('appStarted');
          // For pm2
          if (process.env.PM2) (<any>process).send('ready');
        });
        // Catches server errors
        this.server.on('error', this.onError);
        // Catches signals to gracefully quit
        process.on('SIGTERM', this.gracefulShutdown);
        process.on('SIGINT', this.gracefulShutdown);
      })
      .catch((err: Error) => {
        console.error(`Error during server init: ${err}`);
        this.gracefulShutdown();
      });
  }

  /**
   * Event listener for HTTP server "error" event.
   *
   * @private
   * @param {NodeJS.ErrnoException} error
   * @memberof AppServer
   */
  private onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') throw error;
    const bind = this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;
    // Handles specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
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
   * @param {(string | number)} val
   * @returns {(number | string | boolean)}
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
    console.info('Closing application server ...');
    // Closes DB connection
    this.app.get('db').close();
    this.server.close(() => {
      console.info('Application server closed');
      process.exit(0);
    });
    // Forces close server after 5secs
    setTimeout(e => {
      console.info('Application server closed', e);
      process.exit(1);
    }, 5000);
  }
}

export default new AppServer();
