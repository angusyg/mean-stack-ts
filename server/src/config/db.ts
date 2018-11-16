export default {
  host: {
    doc: 'Database host name/IP',
    format: String,
    default: '127.0.0.1:27017',
    env: 'DB_HOST',
  },
  name: {
    doc: 'Database name',
    format: String,
    default: 'mean',
    env: 'DB_NAME',
  },
};
