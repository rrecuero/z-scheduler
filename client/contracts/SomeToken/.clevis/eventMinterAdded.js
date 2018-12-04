//
// usage: node contract MinterAdded SomeToken
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('MinterAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
