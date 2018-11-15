import { config } from 'dotenv';
import convict, { Config } from 'convict';
import path from 'path';
import app from './app';
import api from './api';
import db from './db';
import log from './log';

class Cfg {
  public config: Config<any>;

  constructor() {
    // Load of environment variables
    config({ path: path.join(__dirname, `./environment/.${process.env.NODE_ENV}`) });
    // Convict load
    this.config = convict({ db, log, api, app });
    // Perform validation
    this.config.validate({ allowed: 'strict' });
  }
}

export default new Cfg().config;
