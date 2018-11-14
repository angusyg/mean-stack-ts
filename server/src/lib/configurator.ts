import { validate, ValidationError } from 'class-validator';
import apiConfig from '../config/api';
import appConfig from '../config/app';
import logger from '../lib/logger';

/**
 * Checks if a configuration is valid
 *
 * @param {object} config config to check
 * @param {string} message log message in case of validation errors
 * @returns {Promise<ValidationError[]>}
 */
function validateConfigFile(config: object, message: string): Promise<ValidationError[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Validation
      const errors: ValidationError[] = await validate(config);
      // If validation errors exist, logs message and errors
      if (errors.length > 0) logger.error(`${message}: ${errors}`);
      return resolve(errors);
    } catch (err) {
      logger.error(err);
      return reject(err);
    }
  });
}

/**
 * Checks all configuration values
 *
 * @export
 */
export default function checkConfig() {
  return new Promise((resolve: Function, reject: Function) => {
    console.log('VALIDATION');

    // Validation of all files
    Promise.all([
      validateConfigFile(apiConfig, 'Validation failed for Api Configuration, check config/api'),
      validateConfigFile(appConfig, 'Validation failed for App Configuration, check config/app')
    ])
      .then((validationResults: ValidationError[][]) => {
        // If at least 1 error has been found => rejects
        if (validationResults.some(result => result.length > 0)) return reject(new Error('Configuration validation failed, check previous log'));
        // All ok, resolves
        return resolve();
      })
      .catch((err: Error) => reject(err));
  });
}
