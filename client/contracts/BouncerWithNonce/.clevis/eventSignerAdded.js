//
// usage: node contract SignerAdded BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
