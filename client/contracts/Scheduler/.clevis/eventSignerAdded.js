//
// usage: node contract SignerAdded Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
