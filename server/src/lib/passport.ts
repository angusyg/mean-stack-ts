import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import apiConfig from '../config/api';
import User from '../models/users';
import { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } from './errors';
import logger from '../lib/logger';
import { JwtPayloadDto, IUser, RequestEnhanced } from '../@types';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * JWT Passport Strategy
 *
 * @class JWTPassport
 */
export default class JWTPassport {
  /**
   * Authentication passport strategy
   *
   * @private
   * @memberof JWTPassport
   */
  private strategy = new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: <string>apiConfig.tokenSecretKey,
    },
    this.strategyCallback
  );

  constructor() {
    // Registers JWT strategy authentication
    passport.use(this.strategy);
  }

  /**
   * Initializes passport middleware on request
   *
   * @returns {RequestHandler}
   * @memberof JWTPassport
   */
  public initialize(): RequestHandler {
    return passport.initialize();
  }

  /**
   * Callback function on authentication success
   *
   * @param {JwtPayloadDto} jwtPayload extracted payload from JWT token
   * @param {Function} cb callback function
   */
  private strategyCallback(jwtPayload: JwtPayloadDto, cb: Function): void {
    logger.debug(`Passport JWT checking: trying to find user with payload: ${jwtPayload}`);
    User.findOne({ login: jwtPayload.login })
      .then((user: IUser | null) => {
        if (!user) {
          logger.debug(`Passport JWT checking: no user found for payload: ${jwtPayload}`);
          return cb(null, false);
        }
        return cb(null, user);
      })
      .catch(/* istanbul ignore next */ (err: Error) => cb(err));
  }

  /**
   * Authenticates User from authorization header and JWT
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof JWTPassport
   */
  public authenticate(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('jwt', { session: false }, (err: Error, user: IUser, info: Error) => {
      logger.debug(`Passport authentication done: - err = '${err}' - info = '${info}' - user = '${user}'`);
      // If error, goes to next middleware
      if (err) return next(err);
      // Checks available info
      if (info) {
        // If error, converts error and goes to next middleware
        if (info instanceof TokenExpiredError) return next(new JwtTokenExpiredError());
        if (info instanceof JsonWebTokenError) return next(new JwtTokenSignatureError());
        if (info instanceof Error && info.message === 'No auth token') return next(new NoJwtTokenError());
        /* istanbul ignore next */
        return next(new UnauthorizedAccessError());
      }
      // If user is not valid, creates error and goes to next mioddleware
      if (!user) return next(new UnauthorizedAccessError('USER_NOT_FOUND', 'No user found for login in JWT Token'));
      // Adds user to request
      (<RequestEnhanced>req).user = user;
      // Goes to next middleware
      return next();
    })(req, res, next);
  }
}
