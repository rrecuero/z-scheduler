//
// usage: node contract Forwarded BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Forwarded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
