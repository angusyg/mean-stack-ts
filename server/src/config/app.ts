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
   * @param {string} origin request origin
   * @param {Function} callback callback function
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
export class AppConfig {
  /**
   * Sungleton instance
   *
   * @private
   * @static
   * @type {AppConfig}
   * @memberof AppConfig
   */
  private static instance: AppConfig;

  /**
   * Application server port
   *
   * @type {number}
   * @memberof AppConfig
   */
  @IsNumber()
  @Min(0)
  public readonly port: number | undefined;

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

  private constructor() {
    this.port = process.env.PORT ? Number.parseInt(process.env.PORT) : undefined;
    this.corsConfiguration = new CorsConfiguration();
  }

  /**
   * Returns a singleton instance of AppConfig
   *
   * @static
   * @returns {AppConfig} singleton instance of AppConfig
   * @memberof AppConfig
   */
  public static getConfig() {
    if (!AppConfig.instance) AppConfig.instance = new AppConfig();
    return AppConfig.instance;
  }
}
