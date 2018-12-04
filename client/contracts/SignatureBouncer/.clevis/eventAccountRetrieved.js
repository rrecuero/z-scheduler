//
// usage: node contract AccountRetrieved SignatureBouncer
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AccountRetrieved', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
