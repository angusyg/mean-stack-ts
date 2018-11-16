export default {
  port: {
    doc: 'Application server port',
    format: 'nat',
    default: 3000,
    env: 'APP_PORT',
  },
  salt: {
    doc: 'Application salt factor',
    format: Number,
    default: 10,
  },
  serve: {
    doc: 'Application to serve static files flag',
    format: Boolean,
    default: false,
    env: 'APP_SERVE_STATIC',
  },
  cors: {
    methods: {
      doc: 'CORS allowed methods',
      format: '*',
      default: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    },
    allowedHeaders: {
      doc: 'CORS allowed headers',
      format: '*',
      default: ['authorization', 'refresh', 'content-type'],
    },
    exposedHeaders: {
      doc: 'CORS exposed headers',
      format: '*',
      default: [],
    },
    credentials: {
      doc: 'CORS authorization to send custom headers',
      format: Boolean,
      default: true,
    },
    maxAge: {
      doc: 'CORS max age between CORS OPTIONS request (in seconds)',
      format: Number,
      default: 600,
    },
    origins: {
      doc: 'CORS allowed origins',
      format: '*',
      default: [],
    },
  },
};