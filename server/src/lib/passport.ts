import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import User from '../models/users';
import { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } from './errors';
import Logger from '../lib/logger';
import { JwtPayloadDto, IUser, RequestEnhanced } from '../@types';
import Configuration from '../config/config';

/**
 * Initializes passport middleware on request
 *
 * @export
 * @returns {RequestHandler} middleware
 */
export function initialize(): RequestHandler {
  return passport.initialize();
}

/**
 * Authenticates User from authorization header and JWT
 *
 * @export
 * @param {Request} req request received
 * @param {Response} res response to send
 * @param {NextFunction} next callback to pass control to next middleware
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error, user: IUser, info: Error) => {
    Logger.debug('Passport authentication done', { err, info, user });
    // If error, goes to next middleware
    if (err) {
      Logger.error('Error while authenticating user request with JWT Token', err);
      return next(err);
    }
    // Checks available info
    if (info) {
      Logger.error('Error while authenticating user request with JWT', info);
      // If error, converts error and goes to next middleware
      if (info instanceof TokenExpiredError) return next(new JwtTokenExpiredError());
      if (info instanceof JsonWebTokenError) return next(new JwtTokenSignatureError());
      if (info instanceof Error && info.message === 'No auth token') return next(new NoJwtTokenError());
      /* istanbul ignore next */
      return next(new UnauthorizedAccessError());
    }
    // If user is not valid, creates error and goes to next mioddleware
    if (!user) {
      Logger.error('User of received JWT Token not found');
      return next(new UnauthorizedAccessError('USER_NOT_FOUND', 'No user found for login in JWT Token'));
    }
    // Adds user to request
    (<RequestEnhanced>req).user = user;
    // Goes to next middleware
    return next();
  })(req, res, next);
}

/**
 * Callback function on authentication success
 *
 * @param {JwtPayloadDto} jwtPayload extracted payload from JWT token
 * @param {Function} cb callback function
 */
function strategyCallback(jwtPayload: JwtPayloadDto, cb: Function): void {
  Logger.debug('Passport JWT checking: trying to find user with payload', jwtPayload);
  User.findOne({ login: jwtPayload.login })
    .then((user: IUser | null) => {
      if (!user) {
        Logger.debug('Passport JWT checking: no user found for payload', jwtPayload);
        return cb(null, false);
      }
      return cb(null, user);
    })
    .catch(/* istanbul ignore next */ (err: Error) => cb(err));
}

// Authentication passport strategy
const strategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: <string>Configuration.get('api.token.access.key'),
  },
  strategyCallback
);

// Registers JWT strategy authentication
passport.use(strategy);
