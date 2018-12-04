//
// usage: node contract SignerAdded BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
