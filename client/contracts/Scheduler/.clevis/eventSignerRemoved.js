//
// usage: node contract SignerRemoved Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
