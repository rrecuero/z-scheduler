//
// usage: node contract Forwarded Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Forwarded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
