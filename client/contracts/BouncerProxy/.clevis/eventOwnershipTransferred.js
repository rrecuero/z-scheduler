//
// usage: node contract OwnershipTransferred BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('OwnershipTransferred', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
