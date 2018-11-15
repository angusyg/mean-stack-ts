export default {
  base: {
    doc: 'API base path',
    format: String,
    default: '/api',
    env: 'API_BASE',
  },
  paths: {
    login: {
      doc: 'API login path',
      format: String,
      default: '/login',
    },
    logout: {
      doc: 'API logout path',
      format: String,
      default: '/logout',
    },
    log: {
      doc: 'API log path',
      format: String,
      default: '/log/:level',
    },
    refresh: {
      doc: 'API refresh access token path',
      format: String,
      default: '/refresh',
    },
    validate: {
      doc: 'API access token validation path',
      format: String,
      default: '/validate',
    },
  },
  token: {
    access: {
      key: {
        doc: 'API access token sign key',
        format: String,
        default: 'JWT-Secret',
        env: 'API_ACCESS_TOKEN_SECRET_KEY',
      },
      header: {
        doc: 'API access token header name',
        format: String,
        default: 'authorization',
      },
      expiration: {
        doc: 'API access token expiration time',
        format: Number,
        default: 60 * 10,
      },
    },
    refresh: {
      header: {
        doc: 'API refresh token header name',
        format: String,
        default: 'refresh',
      },
    },
  },
};