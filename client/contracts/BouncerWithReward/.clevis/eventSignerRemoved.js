//
// usage: node contract SignerRemoved BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('SignerRemoved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
