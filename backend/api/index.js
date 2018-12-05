import relayerRoutes from './relayer';

module.exports = (app, redis, minerAccount, web3) => {
  relayerRoutes(app, redis, minerAccount, web3);
};
