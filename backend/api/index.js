import relayerRoutes from './relayer';

module.exports = (app, redis, accounts) => {
  relayerRoutes(app, redis, accounts);
};
