const express = require('express');
const helmet = require('helmet');

const fs = require('fs');
const Redis = require('ioredis');
const Web3 = require('web3');
const bodyParser = require('body-parser');
const cors = require('cors');
const ContractLoader = require('../eth/contractLoader.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
let contracts;
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

const DESKTOPMINERACCOUNT = 3; // index in geth

let accounts;
web3.eth.getAccounts().then((_accounts) => {
  accounts = _accounts;
  console.log('ACCOUNTS', accounts);
});

const NETWORK = parseInt(fs.readFileSync('../deploy.network').toString().trim(), 10);
if (!NETWORK) {
  console.log('No deploy.network found exiting...');
  process.exit();
}
console.log('NETWORK:', NETWORK);

const transactionListKey = 'transactionList' + NETWORK;


let redisHost = 'localhost';
let redisPort = 6379;
if (false) {
  redisHost = 'cryptogsnew.048tmy.0001.use2.cache.amazonaws.com';
  redisPort = 6379;
}
const redis = new Redis({
  port: redisPort,
  host: redisHost,
});

console.log('LOADING CONTRACTS');
contracts = ContractLoader(['BouncerProxy', 'Example'], web3);

function removeTransaction(sig) {
  redis.get(transactionListKey, (err, result) => {
    let transactions;
    try {
      transactions = JSON.parse(result);
    } catch (e) {
      transactions = [];
    }
    if (!transactions) transactions = [];
    const newtransactions = [];
    for (let i = 0; i < transactions.length; i += 1) {
      if (transactions[i].sig !== sig) {
        newtransactions.push(transactions[i]);
      }
    }
    redis.set(transactionListKey, JSON.stringify(newtransactions), 'EX', 60 * 60 * 24 * 7);
  });
}

function doTransaction(contract, txObject) {
  console.log('Forwarding tx to ', contract._address, ' with local account ', accounts[3]);
  const txparams = {
    from: accounts[DESKTOPMINERACCOUNT],
    gas: txObject.gas,
    gasPrice: Math.round(4 * 1000000000)
  };

  // const result = await clevis('contract','forward','BouncerProxy',
  // accountIndexSender,sig,accounts[accountIndexSigner],
  // localContractAddress('Example'),'0',data,rewardAddress,reqardAmount)
  console.log('TX',
    txObject.sig,
    txObject.parts[1],
    txObject.parts[2],
    txObject.parts[3],
    txObject.parts[4],
    txObject.parts[5],
    txObject.parts[6],
    txObject.parts[7]);
  console.log('PARAMS', txparams);
  contract.methods.forward(
    txObject.sig,
    txObject.parts[1],
    txObject.parts[2],
    txObject.parts[3],
    txObject.parts[4],
    txObject.parts[5],
    txObject.parts[6],
    txObject.parts[7]
  ).send(txparams, (error, transactionHash) => {
    console.log('TX CALLBACK', error, transactionHash);
  })
    .on('error', (err, receiptMaybe) => {
      console.log('TX ERROR', err, receiptMaybe);
    })
    .on('transactionHash', (transactionHash) => {
      console.log('TX HASH', transactionHash);
    })
    .on('receipt', (receipt) => {
      console.log('TX RECEIPT', receipt);
    })
    /* .on('confirmation', (confirmations,receipt)=>{
      console.log('TX CONFIRM',confirmations,receipt)
    }) */
    .then((receipt) => {
      console.log('TX THEN', receipt);
    });
}

function startParsers() {
  web3.eth.getBlockNumber().then((blockNumber) => {
    // parsers here
    //
    //
    console.log('blockNumber', blockNumber);
    setInterval(() => {
      console.log('::: TX CHECKER :::: loading transactions from cache...');
      redis.get(transactionListKey, async (err, result) => {
        let transactions;
        try {
          transactions = JSON.parse(result);
        } catch (e) {
          contracts = [];
        }
        if (!transactions) transactions = [];
        console.log('current transactions:', transactions.length);
        for (let i = 0; i < transactions.length; i += 1) {
          console.log('Check Tx:', transactions[i].sig);
          const contract = new web3.eth.Contract(
            contracts.BouncerProxy._jsonInterface,
            transactions[i].parts[0]
          );
          const ready = await contract.methods.isValidSigAndBlock( // eslint-disable-line
            transactions[i].sig,
            transactions[i].parts[1],
            transactions[i].parts[2],
            transactions[i].parts[3],
            transactions[i].parts[4],
            transactions[i].parts[5],
            transactions[i].parts[6],
            transactions[i].parts[7]
          ).call();
          if (ready) {
            console.log('Transaction is READY ---> ');
            doTransaction(contract, transactions[i]);
            removeTransaction(transactions[i].sig);
          }
        }
      });
    }, 5000);
  });
}

// my local geth node takes a while to spin up so I don't want to start parsing until I'm getting real data
function checkForGeth() {
  contracts.Example.methods.count().call({}, (error, result) => {
    console.log('COUNT', error, result);
    if (error) {
      setTimeout(checkForGeth, 15000);
    } else {
      startParsers();
    }
  });
}
checkForGeth();

app.get('/clear', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/clear');
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({ hello: 'world' }));
  redis.set(transactionListKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
});

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/');
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({ hello: 'world' }));

});

app.get('/miner', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/miner');
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({ address: accounts[DESKTOPMINERACCOUNT] }));

});

app.get('/sigs/:contract', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/sigs/' + req.params.contract);
  const sigsKey = req.params.contract + 'sigs';
  redis.get(sigsKey, (err, result) => {
    res.set('Content-Type', 'application/json');
    res.end(result);
  });
});

app.get('/contracts', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/contracts');
  const deployedContractsKey = 'deployedcontracts' + NETWORK;
  redis.get(deployedContractsKey, (err, result) => {
    res.set('Content-Type', 'application/json');
    res.end(result);
  });

});

app.get('/transactions', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/transactions');
  redis.get(transactionListKey, (err, result) => {
    res.set('Content-Type', 'application/json');
    res.end(result);
  });
});

app.post('/sign', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/sign', req.body);
  const account = web3.eth.accounts.recover(req.body.message, req.body.sig);
  console.log('RECOVERED:', account);
  if (account.toLowerCase() === req.body.account.toLowerCase()) {
    console.log('Correct sig... log them into the contract...');
    const sigsKey = req.body.address + 'sigs';
    redis.get(sigsKey, (err, result) => {
      let sigs;
      try {
        sigs = JSON.parse(result);
      } catch (e) {
        sigs = [];
      }
      if (!sigs) sigs = [];
      console.log('current sigs:', sigs);
      if (sigs.indexOf(req.body.account.toLowerCase()) < 0) {
        sigs.push(req.body.account.toLowerCase());
        console.log('saving sigs:', sigs);
        redis.set(sigsKey, JSON.stringify(sigs), 'EX', 60 * 60 * 24 * 7);
      }
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({ hello: 'world' }));
});

app.post('/deploy', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/deploy', req.body);
  const { contractAddress } = req.body;
  const deployedContractsKey = 'deployedcontracts' + NETWORK;
  redis.get(deployedContractsKey, (err, result) => {
    try {
      contracts = JSON.parse(result);
    } catch (e) {
      contracts = [];
    }
    if (!contracts) contracts = [];
    console.log('current contracts:', contracts);
    if (contracts.indexOf(contractAddress) < 0) {
      contracts.push(contractAddress);
    }
    console.log('saving contracts:', contracts);
    redis.set(deployedContractsKey, JSON.stringify(contracts), 'EX', 60 * 60 * 24 * 7);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ contract: contractAddress }));
  });
});

app.post('/tx', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/tx', req.body);
  const account = web3.eth.accounts.recover(req.body.message, req.body.sig);
  console.log('RECOVERED:', account);
  if (account.toLowerCase() === req.body.parts[1].toLowerCase()) {
    console.log('Correct sig... relay transaction to contract...');
    redis.get(transactionListKey, (err, result) => {
      let transactions;
      try {
        transactions = JSON.parse(result);
      } catch (e) {
        contracts = [];
      }
      if (!transactions) transactions = [];
      console.log('current transactions:', transactions);
      transactions.push(req.body);
      console.log('saving transactions:', transactions);
      redis.set(transactionListKey, JSON.stringify(transactions), 'EX', 60 * 60 * 24 * 7);
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({ hello: 'world' }));
});

app.listen(10001);
console.log('http listening on 10001');
