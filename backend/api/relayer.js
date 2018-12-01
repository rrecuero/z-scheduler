import { config } from 'config';

let transactions = {};

module.exports = (app, redis, accounts, web3) => {
  const DESKTOPMINERACCOUNT = 3;
  const NETWORK = config.get('deploy').network;
  const transactionListKey = 'transactionList' + NETWORK;

  app.get('/api/relayer/clear', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/clear');
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({ hello: 'world' }));
    redis.set(transactionListKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
  });

  app.get('/api/relayer/miner', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({
      address: accounts[DESKTOPMINERACCOUNT]
    }));
  });

  app.get('/api/relayer/sigs/:contract', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/sigs/' + req.params.contract);
    const sigsKey = req.params.contract + 'sigs';
    redis.get(sigsKey, (err, result) => {
      res.set('Content-Type', 'application/json');
      res.end(result);
    });
  });

  app.get('/api/relayer/contracts', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/contracts');
    const deployedContractsKey = 'deployedcontracts' + NETWORK;
    redis.get(deployedContractsKey, (err, result) => {
      res.set('Content-Type', 'application/json');
      res.end(result);
    });
  });

  app.get('/api/relayer/transactions', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/transactions');
    redis.get(transactionListKey, (err, result) => {
      res.set('Content-Type', 'application/json');
      transactions = result;
      res.end(result);
    });
  });

  app.get('/api/relayer/txs/:account', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const thisTxsKey = req.params.account.toLowerCase();
    console.log('Getting Transactions for ', thisTxsKey);
    const allTxs = transactions[thisTxsKey];
    const recentTxns = [];
    console.log('transactions', allTxs);
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

  app.post('/api/relayer/sign', (req, res) => {
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
    res.end(JSON.stringify({ signed: true }));
  });

  app.post('/api/relayer/deploy', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/deploy', req.body);
    let contractsToSave;
    const { contractAddress } = req.body;
    const deployedContractsKey = 'deployedcontracts' + NETWORK;
    redis.get(deployedContractsKey, (err, result) => {
      try {
        contractsToSave = JSON.parse(result);
      } catch (e) {
        contractsToSave = [];
      }
      if (!contractsToSave) contractsToSave = [];
      console.log('current contracts:', contractsToSave);
      if (contractsToSave.indexOf(contractAddress) < 0) {
        contractsToSave.push(contractAddress);
      }
      console.log('saving contracts:', contractsToSave);
      redis.set(deployedContractsKey, JSON.stringify(contractsToSave), 'EX', 60 * 60 * 24 * 7);
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({ contract: contractAddress }));
    });
  });

  app.post('/api/relayer/tx', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/tx', req.body);
    console.log('RECOVER:', req.body.message, req.body.sig);
    const account = web3.eth.accounts.recover(req.body.message, req.body.sig);
    console.log('RECOVERED:', account);
    if (account.toLowerCase() === req.body.parts[1].toLowerCase()) {
      console.log('Correct sig... relay transaction to contract... might want more filtering here');
      redis.get(transactionListKey, (err, result) => {
        let newTransactions;
        try {
          newTransactions = JSON.parse(result);
        } catch (e) {
          newTransactions = [];
        }
        if (!newTransactions) newTransactions = [];
        console.log('current transactions:', newTransactions);
        newTransactions.push(req.body);
        console.log('saving transactions:', newTransactions);
        redis.set(transactionListKey, JSON.stringify(newTransactions), 'EX', 60 * 60 * 24 * 7);
      });
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
    }
  });
};
