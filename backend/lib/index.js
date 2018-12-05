import express from 'express';
import Web3 from 'web3';
import Redis from 'ioredis';
import bodyParser from 'body-parser';
import sanitize from 'mongo-sanitize';
import { config } from 'config';
import winston from 'winston';
import compression from 'compression';
import path from 'path';
import expressWinston from 'express-winston';
import HDWalletProvider from 'truffle-hdwallet-provider';
import Parser from '../parser/parser';
import ContractLoader from '../eth/contractLoader';

const web3 = new Web3();
const app = express();
const version = '1.0';
const port = process.env.PORT || 4000;
const NETWORK = process.env.REACT_APP_NETWORK || config.get('deploy').network;
const bouncerKey = process.env.REACT_APP_BOUNCER || config.get('deploy').bouncerKey;
console.log('bouncerKey', bouncerKey);

const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
  next();
};

if (process.env.NODE_ENV !== 'production') {
  app.use(corsMiddleware);
}
app.use(compression());
// sanitize
const cleanMongo = (req, res, next) => {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  next();
};
app.use(cleanMongo);

// initialize our logger (in our case, winston + papertrail)
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ],
    meta: true
  }),
);

function errorHandler(error, req, res, next) {
  if (error) {
    if (error.name === 'UnauthorizedError') {
      res.status(401).send('Missing authentication credentials.');
    }
    console.error('API Error ', error);
    res.status(500).send({ error: error.toString() });
    res.end();
  } else {
    next();
  }
}

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(errorHandler);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../../client/build')));


let provider = new web3.providers.HttpProvider(NETWORK);
if (process.env.NODE_ENV === 'production') {
  provider = new Web3(new HDWalletProvider(
    process.env.mnemonic,
    NETWORK
  ));
}
web3.setProvider(provider);

let redis = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: process.env.REDIS_URL || config.get('redis_host'),
    port: config.get('redis_port')
  });
}

const contracts = ContractLoader([
  'BouncerProxy',
  'BouncerWithNonce',
  'BouncerWithReward',
  'Scheduler'
], web3);

web3.eth.getAccounts().then((_accounts) => {
  console.log('_accounts', _accounts);
  const parser = new Parser(redis,
    process.env.NODE_ENV === 'production' ? _accounts[0] : _accounts[3],
    bouncerKey,
    contracts[bouncerKey]._jsonInterface,
    web3);

  web3.eth.getBlockNumber().then((blockNumber) => {
    setInterval(() => {
      console.log('::: TX CHECKER :::: loading transactions from cache...', blockNumber);
      parser.loopTransactions();
    }, 5000);
  });
  // Ping route
  app.get('/api/ping', (req, res) => {
    if (req.headers['x-forwarded-for']) {
      // this indicates the request is from nginx server
      const ips = req.headers['x-forwarded-for'].split(', ');
      res.status(200).send({ version, ips });
    } else {
      res.status(200).send({ version });
    }
  });

  // Routes
  require('../api/')(app, redis, _accounts, web3);

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });

  app.listen(port, () => {
    console.log('Listening port', port);
  });
});
