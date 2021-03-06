import { config } from 'config';

const NETWORK = process.env.REACT_APP_NETWORK || config.get('deploy').network;
const transactionListKey = 'transactionList' + NETWORK;
// Singleton
let instance = null;

export default class Parser {
  constructor(redis, account, bouncerKey, bouncerContract, web3) {
    if (!instance) {
      this.redis = redis;
      this.account = account;
      this.bouncerContract = bouncerContract;
      this.bouncerKey = bouncerKey;
      this.web3 = web3;
      this.nonce = 100;
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

  async forwardPerProxy(contract, txObject) {
    let call = null;
    let nonce = await contract.methods.getNonce(this.account).call();
    nonce = Math.max(txObject.parts[5], this.web3.utils.toTwosComplement(nonce + 1));
    if (this.bouncerKey === 'BouncerProxy') {
      call = contract.methods.forward(
        txObject.parts[2],
        txObject.parts[3],
        txObject.parts[4],
      ).encodeABI();
    }
    if (this.bouncerKey === 'BouncerWithNonce') {
      call = contract.methods.forward(
        txObject.parts[2],
        txObject.parts[3],
        txObject.parts[4],
        nonce
      ).encodeABI();
    }
    if (this.bouncerKey === 'BouncerWithReward') {
      call = contract.methods.forward(
        txObject.parts[2],
        txObject.parts[3],
        txObject.parts[4],
        nonce,
        txObject.parts[6],
        txObject.parts[7]
      ).encodeABI();
    }
    if (this.bouncerKey === 'Scheduler') {
      call = contract.methods.schedule(
        txObject.parts[2],
        txObject.parts[3],
        txObject.parts[4],
        nonce,
        txObject.parts[6],
        txObject.parts[7],
        txObject.parts[8]
      ).encodeABI();
    }
    return call;
  }

  async doTransaction(contract, txObject) {
    console.log('Forwarding tx to ', contract._address, ' with local account ', this.account);
    // Do other proxy cases
    const callData = await this.forwardPerProxy(contract, txObject);
    // We packed signature and signer
    const packedMsg = callData + txObject.sig.slice(2) + txObject.parts[1].slice(2);
    const txparams = {
      from: this.account,
      to: txObject.parts[0],
      value: 0,
      data: packedMsg,
      gas: txObject.gas,
      gasPrice: Math.round(4 * (1000000000 + this.nonce))
    };
    this.web3.eth.sendTransaction(txparams, (error, transactionHash) => {
      console.log('TX CALLBACK', error, transactionHash);
    })
      .on('error', (err, receiptMaybe) => {
        console.log('TX ERROR', err, receiptMaybe);
        // handles replacement transaction underpriced and known transaction
        this.nonce += 100;
      })
      .on('transactionHash', (transactionHash) => {
        console.log('TX HASH', transactionHash);
      })
      .on('receipt', (receipt) => {
        console.log('TX RECEIPT', receipt);
      })
      .on('confirmation', (confirmations, receipt) => {
        console.log('TX CONFIRM', confirmations, receipt);
        this.nonce += 1;
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
      let ready = await this.web3.eth.call({
        to: transaction.parts[0],
        data: packedMsg
      });
      if (this.bouncerKey === 'Scheduler' && ready) {
        ready = await instanceContract.methods.isAfterRequiredBlock(
          transaction.parts[8]
        ).call();
      }
      if (ready) {
        console.log('Transaction is READY ---> ');
        this.doTransaction(instanceContract, transaction);
      }
    } catch (e) {
      console.error(e);
    }
  }

  loopTransactions() {
    this.redis.get(transactionListKey, (err, result) => {
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
