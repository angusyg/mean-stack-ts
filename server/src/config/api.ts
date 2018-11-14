import { Response, NextFunction } from 'express';
import { NotFoundResourceError } from '../lib/errors';
import { RequestEnhanced } from '../@types';
import { Secret } from 'jsonwebtoken';
import { RestifyOptions } from 'express-restify-mongoose';
import { IsNotEmpty, IsString, IsNumber, IsPositive, Min, IsDefined } from 'class-validator';

/**
 * API global configuration class
 *
 * @class ApiConfig
 */
class ApiConfig {
  /**
   * Base URL for API
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly base: string = '/api';

  /**
   * JWT token signature secret
   *
   * @type {(Secret | undefined)}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly tokenSecretKey: Secret | string;

  /**
   * JWT token header name
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly accessTokenHeader: string = 'authorization';

  /**
   * JWT token expiration delay
   *
   * @type {number}
   * @memberof ApiConfig
   */
  @IsNumber()
  @Min(0)
  public readonly accessTokenExpirationTime: number = 60 * 10;

  /**
   * Refresh token header name
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly refreshTokenHeader: string = 'refresh';

  /**
   * Login endpoint path
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly loginPath: string = '/login';

  /**
   * Logout endpoint path
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly logoutPath: string = '/logout';

  /**
   * Logger endpoint path
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly loggerPath: string = '/log/:level';

  /**
   * Refresh token endpoint path
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly refreshPath: string = '/refresh';

  /**
   * JWT Token validation endpoint path
   *
   * @type {string}
   * @memberof ApiConfig
   */
  @IsString()
  @IsNotEmpty()
  public readonly validateTokenPath: string = '/validate';

  /**
   * User possible roles
   *
   * @type {object}
   * @memberof ApiConfig
   */
  @IsDefined()
  public readonly roles: object = {
    ADMIN: 'ADMIN',
    USER: 'USER',
  };

  constructor() {
    this.tokenSecretKey = process.env.TOKEN_SECRET || '';
    console.log('KEY', process.env.TOKEN_SECRET);

  }

  /**
   * Get REST endpoint default configuration
   *
   * @returns {RestifyOptions}
   * @memberof ApiConfig
   */
  public getDefaultRestifyOptions(): RestifyOptions {
    const restifyOptions: RestifyOptions = < RestifyOptions > {};
    restifyOptions.name = '';
    restifyOptions.prefix = '';
    restifyOptions.version = '';
    restifyOptions.private = ['__v'];

    /**
     * Error handler on REST resource call
     * @param {Error} err error to handle
     * @param {RequestEnhanced} req request received
     * @param {Response} res response to send
     * @param {NextFunction} next callback to pass control to next middleware
     */
    restifyOptions.onError = (err: Error, req: RequestEnhanced, res: Response, next: NextFunction): void => {
      if (req.erm.statusCode === 404) next(new NotFoundResourceError(`Resource with id '${req.params.id}' does not exist`));
      else next(err);
    }
    return restifyOptions;
  };
}

export default new ApiConfig();

