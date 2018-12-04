//
// usage: node contract MinterRemoved SomeToken
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('MinterRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
