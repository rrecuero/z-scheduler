//
// usage: node contract OwnershipRenounced BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipRenounced', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
