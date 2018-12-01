import { config } from 'config';

const NETWORK = config.get('deploy').network;
const transactionListKey = 'transactionList' + NETWORK;
// Singleton
let instance = null;

export default class Parser {
  constructor(redis, account, bouncerContract, web3) {
    if (!instance) {
      this.redis = redis;
      this.account = account;
      this.bouncerContract = bouncerContract;
      this.web3 = web3;
      instance = this;
    }
    return instance;
  }

  removeTransaction(sig) {
    let transactions;
    this.redis.get(transactionListKey, (err, result) => {
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
      this.redis.set(transactionListKey, JSON.stringify(newtransactions), 'EX', 60 * 60 * 24 * 7);
    });
  }

  doTransaction(contract, txObject) {
    console.log('Forwarding tx to ', contract._address, ' with local account ', this.account);
    const txparams = {
      from: this.account,
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

  async checkTransaction(transaction) {
    console.log('transaction', transaction);
    const instanceContract = new this.web3.eth.Contract(
      this.bouncerContract,
      transaction.parts[0]
    );
    const ready = await instanceContract.methods.isValidSignatureAndData(
      transaction.sig,
      transaction.parts[1],
      transaction.parts[2],
      transaction.parts[3],
      transaction.parts[4],
      transaction.parts[5],
      transaction.parts[6],
      transaction.parts[7]
    ).call();
    if (ready) {
      console.log('Transaction is READY ---> ');
      this.doTransaction(instanceContract, transaction);
      this.removeTransaction(transaction.sig);
    }
  }

  loopTransactions() {
    this.redis.get(transactionListKey, async (err, result) => {
      let transactions;
      try {
        transactions = JSON.parse(result) || [];
      } catch (e) {
        transactions = [];
      }
      console.log('current transactions:', transactions.length);
      for (let i = 0; i < transactions.length; i += 1) {
        console.log('Check Tx:', transactions[i].sig);
        this.checkTransaction(transactions[i]);
      }
    });
  }

}
