import { CorsOptions } from 'cors';
import { IsNumber, Min, IsDefined, IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

/**
 * Cross origin middleware configuration
 *
 * @class
 * @implements {CorsOptions}
 */
class CorsConfiguration implements CorsOptions {
  /**
   * Allowed methods on cross origin request
   *
   * @type {string[]}
   * @memberof CorsConfiguration
   */
  @IsArray()
  @IsString({ each : true })
  public readonly methods: string[] = [
    'GET',
    'POST',
    'OPTIONS',
    'PUT',
    'PATCH',
    'DELETE'
  ];

  /**
   * Allowed headers on cross origin request
   *
   * @type {string[]}
   * @memberof CorsConfiguration
   */
  @IsArray()
  @IsString({ each : true })
  public readonly allowedHeaders: string[] = [
    'Authorization',
    'Refresh',
    'Content-type'
  ];

  /**
   * Credential request allowed
   *
   * @type {boolean}
   * @memberof CorsConfiguration
   */
  @IsBoolean()
  public readonly credentials: boolean = true;

  /**
   * Max age between cross origin OPTION request (in seconds)
   *
   * @type {number}
   * @memberof CorsConfiguration
   */
  @IsNumber()
  public readonly maxAge: number = 600;

  /**
   *
   * Checks if request origin is a domain authorized
   *
   * @param {string} origin
   * @param {Function} callback
   * @returns {void}
   * @memberof CorsConfiguration
   */
  public origin(origin: string, callback: Function): void {
    // Origins init
    const whitelistOrigins: string | string[] = process.env.CORS_ORIGINS || [];
    // If no white list origins, authorized
    if (whitelistOrigins.length === 0) return callback(null, true);
    // If request origin is in white list origin, authorized
    if (whitelistOrigins.indexOf(origin) !== -1) return callback(null, true);
    // Unauthorized origin
    return callback(new Error('Not allowed by CORS'));
  }
}

/**
 * App global configuration class
 *
 * @class AppConfig
 */
class AppConfig {
  /**
   * Application server port
   *
   * @type {number}
   * @memberof AppConfig
   */
  @IsNumber()
  @Min(0)
  public readonly port: number;

  /**
   * Salt factor for user password crypt
   *
   * @type {number}
   * @memberof AppConfig
   */
  @IsNumber()
  @Min(0)
  public readonly saltFactor: number = 10;

  /**
   * CORS configuration options
   *
   * @type {CorsConfiguration}
   * @memberof AppConfig
   */
  @IsDefined()
  @ValidateNested()
  public readonly corsConfiguration: CorsConfiguration;

  constructor() {
    this.port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
    this.corsConfiguration = new CorsConfiguration();
  }
}

export default new AppConfig();
