//
// usage: node contract AccountRetrieved Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AccountRetrieved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
