//
// usage: node contract SignerRemoved BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
