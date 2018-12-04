//
// usage: node contract OwnershipRenounced Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipRenounced', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
