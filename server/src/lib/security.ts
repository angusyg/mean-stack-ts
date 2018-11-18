import { Request, Response, NextFunction, RequestHandler } from 'express';
import { RequestEnhanced } from '../@types';
import * as passport from './passport';
import { ForbiddenOperationError } from './errors';
import { CorsOptions } from 'cors';
import Configuration from '../config/config';
import Logger from './logger';

/**
 * Initializes passport security
 *
 * @export
 * @returns {RequestHandler} initialization middleware
 */
export function initialize(): RequestHandler {
  return passport.initialize();
}

/**
 * Checks if request is authenticated or not
 *
 * @export
 * @param {Request} req request received
 * @param {Response} res response to send
 * @param {NextFunction} next callback to pass control to next middleware
 */
export function requiresLogin(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate(req, res, next);
}

/**
 * Calls middleware with user request roles
 *
 * @export
 * @param {string[]} [roles] array of roles to call the endpoint
 * @returns {Function} middleware to check if user has role to call endpoint
 */
export function requiresRole(roles?: string[]): Function {
  return (req: RequestEnhanced, res: Response, next: NextFunction) => {
    Logger.debug('Checking roles of user for request', { roles, user: req.user });
    // If no role, lets pass request to next middleware
    if (!roles || roles.length === 0) return next();
    // Checks if current request user has an authorized role
    if (req.user && roles.some(role => req.user.roles.includes(role))) return next();
    // No authorized role, creates an error and goes to next middleware
    Logger.error('Access with bad user role', { roles, user: req.user });
    return next(new ForbiddenOperationError());
  };
}

/**
 * Returns CORS middleware options
 *
 * @export
 * @returns {CorsOptions} CORS middleware options
 */
export function getCorsConfiguration(): CorsOptions {
  return {
    methods: Configuration.get('app.cors.methods'),
    allowedHeaders: Configuration.get('app.cors.allowedHeaders'),
    exposedHeaders: Configuration.get('app.cors.exposedHeaders'),
    credentials: Configuration.get('app.cors.credentials'),
    maxAge: Configuration.get('app.cors.maxAge'),
    origin: (origin: string, callback: Function): void => {
      // Origins init
      const whitelistOrigins: string | string[] = Configuration.get('app.cors.origins');
      Logger.debug('Checking origin of CORS request', { whitelistOrigins, origin });
      // If no white list origins, authorized
      if (whitelistOrigins.length === 0) return callback(null, true);
      // If request origin is in white list origin, authorized
      if (whitelistOrigins.indexOf(origin) !== -1) return callback(null, true);
      // Unauthorized origin
      Logger.error('Unallowed CORS request', { whitelistOrigins, origin });
      return callback(new Error('Not allowed by CORS'));
    },
  };
}
