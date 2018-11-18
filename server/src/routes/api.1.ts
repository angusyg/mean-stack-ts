import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import apiController from '../controllers/api';
import { requiresLogin, requiresRole } from '../lib/security';
import User from '../models/users';
import Configuration from '../config/config';
import Logger from '../lib/logger';
import { ApiError } from '../lib/errors';
import { Level } from 'pino';

/**
 * API router
 *
 * @class ApiRouter
 */
@Controller('/api')
export class ApiController {

    @Post('/log/:level')
    public log(@Param('level') level:string, @Body() message: string) {
      if (['trace', 'debug', 'info', 'warn', 'error', 'fatal'].indexOf(level) < 0) throw new ApiError(`${level} is not a valid log level`);
      Logger.log(<Level>level, 'Client log', JSON.stringify(message));
    }

    /**
     * @path {POST} /login
     * @body {object} infos
     * @body {string} infos.login    - user login
     * @body {string} infos.password - user password
     * @response {json} tokens
     * @response {String} tokens.refreshToken
     * @response {String} tokens.accessToken
     * @code {200} if successful
     * @code {401} if login is not found is database
     * @code {401} if password is not valid
     * @name login
     */
    this.router.post(Configuration.get('api.paths.login'), apiController.login);

    /**
     * @path {GET} /logout
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @code {204} if successful, no content
     * @code {401} if login is not valid
     * @name logout
     */
    this.router.get(Configuration.get('api.paths.logout'), requiresLogin, apiController.logout);

    /**
     * @path {GET} /refresh
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @header {string} refresh       - Header supporting refresh token
     * @code {200} if successful
     * @code {401} if refresh is not allowed
     * @code {500} if user in JWT token is not found
     * @code {500} if an unexpected error occurred
     * @name refresh
     */
    this.router.get(Configuration.get('api.paths.refresh'), requiresLogin, apiController.refreshToken);

    /**
     * @path {GET} /validate
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @code {204} if successful
     * @code {401} if JWT is invalid
     * @name validate
     */
    this.router.get(Configuration.get('api.paths.validate'), requiresLogin, apiController.validateToken);
  }

  /**
   * Adds all REST resources to router
   *
   * @private
   * @memberof ApiRouter
   */
  private resources(): void {
    // Add of REST User endpoint
    User.restify(this.router, [requiresLogin, requiresRole(['USER'])]);
  }
}

export default new ApiRouter().router;
