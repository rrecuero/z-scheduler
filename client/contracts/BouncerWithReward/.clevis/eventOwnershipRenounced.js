//
// usage: node contract OwnershipRenounced BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipRenounced', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
