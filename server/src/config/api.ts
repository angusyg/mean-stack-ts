export default {
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