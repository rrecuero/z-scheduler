import { config } from 'config';
import Web3 from 'web3';
import ContractLoader from '../eth/contractLoader';

const web3 = new Web3();
const contracts = ContractLoader(['BouncerProxy'], web3);
const transactions = {};
const DESKTOPMINERACCOUNT = 3;
web3.setProvider(new web3.providers.HttpProvider(config.get('deploy').network));
let accounts = [];
web3.eth.getAccounts().then((_accounts) => {
  accounts = _accounts;
  console.log('ACCOUNTS', accounts);
});

module.exports = (app) => {

  app.get('/api/relayer/miner', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({
      address: accounts[DESKTOPMINERACCOUNT]
    }));
  });

  app.get('/api/relayer/txs/:account', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const thisTxsKey = req.params.account.toLowerCase();
    console.log('Getting Transactions for ', thisTxsKey);
    const allTxs = transactions[thisTxsKey];
    const recentTxns = [];
    console.log('transactions', transactions);
    if (allTxs) {
      for (let i = 0; i < allTxs.length; i += 1) {
        const currentTx = allTxs[i];
        const age = Date.now() - currentTx.time;
        if (age < 120000) {
          recentTxns.push(currentTx);
        }
      }
    }
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(recentTxns));
  });

  app.post('/api/relayer/tx', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/tx', req.body);
    console.log('RECOVER:', req.body.message, req.body.sig);
    const account = web3.eth.accounts.recover(req.body.message, req.body.sig);
    console.log('RECOVERED:', account);
    if (account.toLowerCase() === req.body.parts[1].toLowerCase()) {
      console.log('Correct sig... relay transaction to contract... might want more filtering here');

      const contract = new web3.eth.Contract(
        contracts.Proxy._jsonInterface,
        req.body.parts[0]
      );
      console.log('Forwarding tx to ', contract._address, ' with local account ', accounts[3]);

      const txparams = {
        from: accounts[DESKTOPMINERACCOUNT],
        gas: req.body.gas,
        gasPrice: Math.round(4 * 1000000000)
      };
      // first get the hash to see if there is already a tx in motion
      const hash = await contract.methods.getHash(
        req.body.parts[1],
        req.body.parts[2],
        req.body.parts[3],
        req.body.parts[4]
      ).call();
      console.log('HASH:', hash);

      // const result = await clevis('contract','forward',
      // 'BouncerProxy',accountIndexSender,sig,accounts[accountIndexSigner],
      // localContractAddress('Example'),'0',data,rewardAddress,reqardAmount)
      console.log('TX', req.body.sig, req.body.parts[1], req.body.parts[2],
        req.body.parts[3], req.body.parts[4]);
      console.log('PARAMS', txparams);
      contract.methods.forward(
        req.body.sig,
        req.body.parts[1],
        req.body.parts[2],
        req.body.parts[3],
        req.body.parts[4]
      ).send(
        txparams, (error, transactionHash) => {
          console.log('TX CALLBACK', error, transactionHash);
          res.set('Content-Type', 'application/json');
          res.end(JSON.stringify({
            transactionHash
          }));
          const fromAddress = req.body.parts[1].toLowerCase();
          if (!transactions[fromAddress]) {
            transactions[fromAddress] = [];
          }
          if (transactions[fromAddress].indexOf(transactions) < 0) {
            transactions[fromAddress].push({
              hash: transactionHash,
              time: Date.now(),
              metatx: true,
              miner: accounts[DESKTOPMINERACCOUNT]
            });
          }
        }
      )
        .on('error', (err, receiptMaybe) => {
          console.log('TX ERROR', err, receiptMaybe);
        })
        .on('transactionHash', (transactionHash) => {
          console.log('TX HASH', transactionHash);
        })
        .on('receipt', (receipt) => {
          console.log('TX RECEIPT', receipt);
        })
        .on('confirmation', (confirmations, receipt) => {
          console.log('TX CONFIRM', confirmations, receipt);
        })
        .then((receipt) => {
          console.log('TX THEN', receipt);
        });
    }
  });
};
