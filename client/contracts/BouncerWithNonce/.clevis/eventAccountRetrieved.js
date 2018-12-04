//
// usage: node contract AccountRetrieved BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AccountRetrieved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
