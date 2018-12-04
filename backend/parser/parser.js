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
    console.log('execute TX', txObject);

    // Do other proxy cases
    const callData = contract.methods.forward(
      txObject.parts[2],
      txObject.parts[3],
      txObject.parts[4],
    ).encodeABI();
    // We packed signature and signer
    const packedMsg = callData + txObject.sig.slice(2) + txObject.parts[1].slice(2);
    let txparams = {
      from: this.account,
      to: txObject.parts[0],
      value: 0,
      data: packedMsg,
      gas: txObject.gas,
      gasPrice: Math.round(4 * 1000000000)
    };
    if (txObject.parts[3] > 0) {
      txparams = {
        from: this.account,
        to: txObject.parts[2],
        value: txObject.parts[3]
      };
    }
    console.log('txparams', txparams);
    this.web3.eth.sendTransaction(txparams, (error, transactionHash) => {
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
      .on('confirmation', (confirmations, receipt) => {
        console.log('TX CONFIRM', confirmations, receipt);
      })
      .then((receipt) => {
        this.removeTransaction(txObject.sig);
        console.log('TX THEN', receipt);
      });
  }

  async checkTransaction(transaction) {
    const instanceContract = new this.web3.eth.Contract(
      this.bouncerContract,
      transaction.parts[0]
    );
    try {
      const callData = instanceContract.methods.isValidSignatureAndData(
        transaction.parts[1],
        transaction.sig
      ).encodeABI();
      // We packed signature and signer
      const packedMsg = callData + transaction.sig.slice(2) + transaction.parts[1].slice(2);
      const ready = await this.web3.eth.call({
        to: transaction.parts[0],
        data: packedMsg
      });
      if (ready) {
        console.log('Transaction is READY ---> ');
        this.doTransaction(instanceContract, transaction);
      }
    } catch (e) {
      console.error(e);
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
