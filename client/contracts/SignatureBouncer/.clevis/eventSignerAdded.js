//
// usage: node contract SignerAdded SignatureBouncer
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
