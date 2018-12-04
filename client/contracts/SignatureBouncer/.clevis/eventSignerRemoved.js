//
// usage: node contract SignerRemoved SignatureBouncer
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
