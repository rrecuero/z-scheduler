import relayerRoutes from './relayer';

module.exports = (app, redis, accounts, web3) => {
  relayerRoutes(app, redis, accounts, web3);
};
