//
// usage: node contract Received Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Received', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
