//
// usage: node contract Transfer SomeToken
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Transfer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
