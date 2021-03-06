const clevis = require("clevis")
const chai = require("chai")
const HDWalletProvider = require("truffle-hdwallet-provider")
const assert = chai.assert
const { soliditySha3 } = require('web3-utils');

const fs = require('fs')
const Web3 = require('web3')
const clevisConfig = JSON.parse(fs.readFileSync("clevis.json").toString().trim())
const web3 = new Web3(
  clevisConfig.USE_INFURA ?
    new HDWalletProvider(
      process.env.mnemonic,
      clevisConfig.provider) :
    new Web3.providers.HttpProvider(clevisConfig.provider)
);

function localContractAddress(contract){
  return fs.readFileSync(clevisConfig.CONTRACTS_FOLDER+"/"+contract+ "/" + contract + ".address").toString().trim()
}
function localContractAbi(contract){
  return JSON.parse(fs.readFileSync(clevisConfig.CONTRACTS_FOLDER+"/"+contract+ "/"+ contract +".abi").toString().trim())
}
function printTxResult(result){
  if(!result||!result.transactionHash){
    console.log("ERROR".red,"MISSING TX HASH".yellow)
  }else{
    console.log(tab,result.transactionHash.gray,(""+result.gasUsed).yellow)
  }
}
function bigHeader(str){
  return "########### "+str+" "+Array(128-str.length).join("#")
}
const tab = "\t\t";
module.exports = {
  web3:web3,
  localContractAddress,
  contracts:fs.readFileSync(clevisConfig.ROOT_FOLDER + "/contracts.clevis").toString().trim().split("\n"),
  reload:()=>{
    describe('#reload() ', function() {
      it('should force browser to reload', async function() {
        fs.writeFileSync(clevisConfig.CRA_FOLDER + "/../public/reload.txt",Date.now());
      });
    });
  },
  version:()=>{
    describe('#version() ', function() {
      it('should get version', async function() {
        this.timeout(90000)
        const result = await clevis("version")
        console.log(result)
      });
    });
  },
  blockNumber:()=>{
    describe('#blockNumber() ', function() {
      it('should get blockNumber', async function() {
        this.timeout(90000)
        const result = await clevis("blockNumber")
        console.log(result)
      });
    });
  },
  compile:(contract)=>{
    describe('#compile() '+contract.magenta, function() {
      it('should compile '+contract.magenta+' contract to bytecode', async function() {
        this.timeout(90000)
        const result = await clevis("compile",contract)
        console.log(result)
        assert(Object.keys(result.contracts).length>0, "No compiled contacts found.")
        let count = 0
        for(let c in result.contracts){
          console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
          if(count++ === 0){
              assert(result.contracts[c].bytecode.length > 1, "No bytecode for contract "+c)
          }
        }
      });
    });
  },
  deploy:(contract,accountindex)=>{
    describe('#deploy() '+contract.magenta, function() {
      it('should deploy '+contract.magenta+' as account '+accountindex, async function() {
        this.timeout(360000)
        const result = await clevis("deploy",contract,accountindex)
        printTxResult(result)
        console.log(tab+"Address: "+result.contractAddress.blue)
        assert(result.contractAddress)
      });
    });
  },

  publish:()=>{
    describe('#publish() ', function() {
      it('should inject contract address and abi into web app', async function() {
        this.timeout(120000)
        const fs = require("fs")
        console.log(tab,"Publishing to CRA folder",clevisConfig.CRA_FOLDER)
        if(!fs.existsSync(clevisConfig.CRA_FOLDER)){
          fs.mkdirSync(clevisConfig.CRA_FOLDER);
        }
        if(!fs.existsSync(clevisConfig.CRA_FOLDER + "/contracts")){
          fs.mkdirSync(clevisConfig.CRA_FOLDER + "/contracts");
        }
        for(let c in module.exports.contracts){
          let thisContract = module.exports.contracts[c]
          console.log(tab,thisContract.magenta)
          let address = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER + "/" + thisContract+"/"+thisContract+".address").toString().trim()
          console.log(tab,"ADDRESS:",address.blue)
          assert(address,"No Address!?")
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/"+thisContract+".address.js","module.exports = \""+address+"\"");
          let blockNumber = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER +"/" + thisContract + "/"+thisContract+".blockNumber").toString().trim()
          console.log(tab,"blockNumber:",blockNumber.blue)
          assert(blockNumber,"No blockNumber!?")
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".blocknumber.js","module.exports = \""+blockNumber+"\"");
          let abi = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER +"/" + thisContract +"/"+thisContract+".abi").toString().trim()
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".abi.js","module.exports = "+abi);
          let bytecode = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER + "/" + thisContract +"/"+thisContract+".bytecode").toString().trim()
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".bytecode.js","module.exports = \""+bytecode+"\"");
        }
        fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/contracts.js","module.exports = "+JSON.stringify(module.exports.contracts));
        module.exports.reload()
      });
    });
  },
  metamask:()=>{
    describe('#transfer() ', function() {
      it('should give metamask account some ether or tokens to test', async function() {
        this.timeout(600000)
        let result = await clevis("sendTo","0.1","0","0x15b7FeC273F6f09786ae3Efc6E0aA9Ea33f56508")///<<<-------- change this to your metamask accounts
        printTxResult(result)
        result = await clevis("sendTo","0.1","0","0x15b7FeC273F6f09786ae3Efc6E0aA9Ea33f56508")///<<<-------- change this to your metamask accounts
        printTxResult(result)
        //here is an example of running a funtion from within this object:
        //module.exports.mintTo("Greens",0,"0x2a906694d15df38f59e76ed3a5735f8aabcce9cb",20)
        //view more examples here: https://github.com/austintgriffith/galleass/blob/master/tests/galleass.js
      });
    });
  },


  ////----------------------------------------------------------------------------///////////////////
  addBouncer:(accountIndex,bouncerAccountIndex, bouncerKey)=>{
    describe('#addBouncer', function() {
      it('should add account with index bouncerAccountIndex as a bouncer', async function() {
        this.timeout(600000);
        const accounts = await clevis("accounts");
        const result = await clevis("contract","addSigner",bouncerKey,accountIndex,accounts[bouncerAccountIndex]);
        printTxResult(result);
      });
    });
  },
  fwd:(accountIndexSender,accountIndexSigner, bouncerKey)=>{
    describe('#fwd', function() {
      it('should build meta transaction into data, sign it as accountIndexSigner and send it as accountIndexSender ', async function() {
        this.timeout(600000)
        let testAbi = localContractAbi("Example")
        let testAddress = localContractAddress("Example")
        var data = (new web3.eth.Contract(testAbi,testAddress)).methods.addAmount(5).encodeABI()
        executeMetaTx(accountIndexSender, accountIndexSigner, bouncerKey, data)
      });
    });
  },
  fwdSendEther:(accountIndexSender,accountIndexSigner, bouncerKey, accountIndexReceiver, amount)=>{
    describe('#fwdSendEther', function() {
      it('should build meta transaction into data, sign it as accountIndexSigner and send it as accountIndexSender ', async function() {
        this.timeout(600000)
        const data = "0x00";
        executeMetaTx(accountIndexSender, accountIndexSigner, bouncerKey, data)
      });
    });
  },
  fwdToken:(accountIndexSender,accountIndexSigner, bouncerKey, accountIndexReceiver)=>{
    describe('#fwdAndPaySomeToken', function() {
      it('should build meta transaction into data, sign it as accountIndexSigner and send it as accountIndexSender ', async function() {
        this.timeout(600000)
        const accounts = await clevis("accounts")
        let testAbi = localContractAbi("SomeToken")
        let testAddress = localContractAddress("SomeToken")
        var data = (new web3.eth.Contract(testAbi,testAddress)).methods.transfer(accounts[accountIndexReceiver], 1).encodeABI()
        executeMetaTx(accountIndexSender, accountIndexSigner, bouncerKey, data)
      });
    });
  },
  mintSomeToken:(accountIndex,toAccountIndex,amount)=>{
    describe('#mintSomeToken', function() {
      it('should mint SomeToken to toAccountIndex', async function() {
        this.timeout(600000)
        const accounts = await clevis("accounts")
        const result = await clevis("contract","Mint","SomeToken",accountIndex,accounts[toAccountIndex],amount)
        printTxResult(result)
      });
    });
  },
  getNonce:(accountIndex,toAccountIndex,amount)=>{
    describe('#getNonce', function() {
      it('should getNonce', async function() {
        this.timeout(600000)
        const accounts = await clevis("accounts")
        const result = await clevis("contract","getNonce","Scheduler",accounts[accountIndex])
        assert(result >= 0);
      });
    });
  },

  ////----------------------------------------------------------------------------///////////////////


  full:()=>{
    describe(bigHeader('COMPILE'), function() {
      it('should compile all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","compile")
        console.log('result', result);
        assert(result === 0,"deploy ERRORS")
      });
    });
    describe(bigHeader('FAST'), function() {
      it('should run the fast test (everything after compile)', async function() {
        this.timeout(6000000)
        const result = await clevis("test","fast")
        assert(result === 0,"fast ERRORS")
      });
    });
  },

  fast:()=>{
    describe(bigHeader('DEPLOY'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","deploy")
        assert(result === 0,"deploy ERRORS")
      });
    });
    describe(bigHeader('METAMASK'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","metamask")
        assert(result === 0,"metamask ERRORS")
      });
    });
    describe(bigHeader('PUBLISH'), function() {
      it('should publish all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","publish")
        assert(result === 0,"publish ERRORS")
      });
    });
  },
}

const executeMetaTx = async (accountIndexSender,accountIndexSigner, bouncerKey, data) => {
  const accounts = await clevis("accounts")
  let nonce = 0;
  if (bouncerKey !== 'BouncerProxy') {
    nonce = await clevis("contract","getNonce",bouncerKey, accounts[accountIndexSender]);
    nonce ++;
  }
  const rewardAddress = "0x0000000000000000000000000000000000000000"
  const rewardAmount = 0
  const parts = [
    localContractAddress(bouncerKey),
    accounts[accountIndexSigner],
    localContractAddress("Example"),
    web3.utils.toTwosComplement(0),
    data,
    web3.utils.toTwosComplement(nonce),
    rewardAddress,
    web3.utils.toTwosComplement(rewardAmount),
    web3.utils.toTwosComplement(0)
  ]
  const hashOfMessage = soliditySha3(...parts);

  const message = hashOfMessage

  let sig = await web3.eth.sign(
    message, accounts[accountIndexSigner]);
  // Now we check the call

  const instanceContract = new web3.eth.Contract(
    localContractAbi(bouncerKey),
    localContractAddress(bouncerKey)
  );
  const callData = instanceContract.methods.isValidSignatureAndData(
    accounts[accountIndexSigner],
    sig
  ).encodeABI();
  // We packed signature and signer
  const packedMsg = callData +
    sig.slice(2) +
    accounts[accountIndexSigner].slice(2);
  const ready = await web3.eth.call({
    to: localContractAddress(bouncerKey),
    data: packedMsg
  });
  assert(ready > 0);
  let callData2;
  if (bouncerKey === 'BouncerProxy') {
    callData2 = instanceContract.methods.forward(
      localContractAddress("Example"),
      web3.utils.toTwosComplement(0),
      data
    ).encodeABI();
  }
  if (bouncerKey === 'BouncerWithNonce') {
    callData2 = instanceContract.methods.forward(
      localContractAddress("Example"),
      web3.utils.toTwosComplement(0),
      data,
      web3.utils.toTwosComplement(nonce)
    ).encodeABI();
  }
  if (bouncerKey === 'BouncerWithReward') {
    callData2 = instanceContract.methods.forward(
      localContractAddress("Example"),
      web3.utils.toTwosComplement(0),
      data,
      web3.utils.toTwosComplement(nonce),
      rewardAddress,
      web3.utils.toTwosComplement(rewardAmount)
    ).encodeABI();
  }
  if (bouncerKey === 'Scheduler') {
    callData2 = instanceContract.methods.schedule(
      localContractAddress("Example"),
      web3.utils.toTwosComplement(0),
      data,
      web3.utils.toTwosComplement(nonce),
      rewardAddress,
      web3.utils.toTwosComplement(rewardAmount),
      web3.utils.toTwosComplement(0)
    ).encodeABI();
  }
  // We packed signature and signer
  const packedMsg2 = callData2 + sig.slice(2) + accounts[accountIndexSigner].slice(2);
  const txparams = {
    to: localContractAddress(bouncerKey),
    from: accounts[accountIndexSender],
    gas: 920000,
    gasPrice: Math.round(4 * 1000000000),
    value: 0,
    data: packedMsg2
  };
  web3.eth.sendTransaction(txparams, (error, transactionHash) => {
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
    // .on('confirmation', (confirmations, receipt) => {
    //   console.log('TX CONFIRM', confirmations, receipt);
    // })
    .then((receipt) => {
      console.log('TX THEN', receipt);
    });
}
