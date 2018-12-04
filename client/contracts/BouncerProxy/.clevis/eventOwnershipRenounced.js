//
// usage: node contract OwnershipRenounced BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipRenounced', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
