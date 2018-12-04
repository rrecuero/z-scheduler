//
// usage: node contract SignerRemoved BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
