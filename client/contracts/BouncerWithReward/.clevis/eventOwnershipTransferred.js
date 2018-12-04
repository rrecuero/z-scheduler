//
// usage: node contract OwnershipTransferred BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipTransferred', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
