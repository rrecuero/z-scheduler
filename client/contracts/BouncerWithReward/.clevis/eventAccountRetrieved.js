//
// usage: node contract AccountRetrieved BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AccountRetrieved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
