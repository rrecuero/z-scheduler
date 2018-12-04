//
// usage: node contract Received BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Received', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
