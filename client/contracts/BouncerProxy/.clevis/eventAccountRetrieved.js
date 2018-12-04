//
// usage: node contract AccountRetrieved BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AccountRetrieved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
