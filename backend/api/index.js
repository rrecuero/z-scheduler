import relayerRoutes from './relayer';

module.exports = (app, db) => {
  relayerRoutes(app, db);
};
