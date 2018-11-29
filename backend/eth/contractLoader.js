module.exports = (contractList, web3) => {
  const contracts = [];
  for (let i = 0; i < contractList.length; i += 1) {
    try {
      const c = contractList[i];
      // console.log('process.cwd()', process.cwd());
      const abi = require(process.cwd() + "/../src/contracts/" + c + ".abi.js"); //eslint-disable-line
      const address = require( //eslint-disable-line
        process.cwd() + "/../src/contracts/"+ c +".address.js"); //eslint-disable-line
      contracts[c] = new web3.eth.Contract(
        abi, address
      );
      contracts[c].blockNumber = require(process.cwd() + "/../src/contracts/" //eslint-disable-line
        + c + ".blocknumber.js"); //eslint-disable-line
    } catch (e) {
      console.log(e);
    }
  }
  return contracts;
};
