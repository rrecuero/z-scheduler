//
// usage: node contract OwnershipTransferred Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipTransferred', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
