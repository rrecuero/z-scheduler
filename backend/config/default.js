/* eslint-disable */
export const config = {
  // DB
  mongodb: {
    params: {
      poolSize: 10,
      autoReconnect: true,
      connectTimeoutMS: 10000
    },
    dbname: 'heroku_nx9rz983',
    url: "mongodb://...",
    reconnectAttempts: 3
  },
  logger: {
    host: 'test',
    port: '1'
  },
  redis_host: 'localhost',
  redis_port: 6379,
  deploy: {
    bouncerKey: 'BouncerProxy',
    network: 'http://0.0.0.0:8545' //local ganache
  }
};
