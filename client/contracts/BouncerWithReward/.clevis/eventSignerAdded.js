//
// usage: node contract SignerAdded BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerAdded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
