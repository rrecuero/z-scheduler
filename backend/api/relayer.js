import { config } from 'config';

let transactions = {};

module.exports = (app, redis, accounts, web3) => {
  const DESKTOPMINERACCOUNT = 3;
  const NETWORK = config.get('deploy').network;
  const transactionListKey = 'transactionList' + NETWORK;
  const deployedContractsKey = 'deployedcontracts' + NETWORK;

  app.get('/api/relayer/clear', (req, res) => {
    redis.set(transactionListKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
    redis.set(deployedContractsKey, JSON.stringify([]), 'EX', 60 * 60 * 24 * 7);
    res.end(JSON.stringify({ success: true }));
  });

  app.get('/api/relayer/miner', (req, res) => {
    res.end(JSON.stringify({
      address: accounts[DESKTOPMINERACCOUNT]
    }));
  });

  app.get('/api/relayer/sigs/:contract', (req, res) => {
    console.log('/sigs/' + req.params.contract);
    const sigsKey = req.params.contract + 'sigs';
    redis.get(sigsKey, (err, result) => {
      console.log('result', result);
      res.end(JSON.stringify(result || []));
    });
  });

  app.get('/api/relayer/contracts', (req, res) => {
    console.log('/contracts');
    redis.get(deployedContractsKey, (err, result) => {
      res.end(result);
    });
  });

  app.get('/api/relayer/transactions', (req, res) => {
    console.log('/transactions');
    redis.get(transactionListKey, (err, result) => {
      transactions = result;
      res.end(result);
    });
  });

  app.get('/api/relayer/txs/:account', (req, res) => {
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
    res.end(JSON.stringify(recentTxns));
  });

  app.post('/api/relayer/sign', (req, res) => {
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
    res.end(JSON.stringify({ success: true }));
  });

  app.post('/api/relayer/deploy', (req, res) => {
    console.log('/deploy', req.body);
    let contractsToSave;
    const { contractAddress } = req.body;
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
      res.end(JSON.stringify({ contract: contractAddress }));
    });
  });

  app.post('/api/relayer/tx', async (req, res) => {
    console.log('/tx', req.body);
    console.log('RECOVER:', req.body.message, req.body.sig);
    const account = web3.eth.accounts.recover(req.body.message, req.body.sig);
    console.log('RECOVERED:', account);
    if (account.toLowerCase() === req.body.parts[1].toLowerCase()) {
      console.log('Correct sig... relay transaction to contract... might want more filtering here');
      // Add immediate proxy tx
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
      res.end(JSON.stringify({ success: true }));
    }
  });
};
