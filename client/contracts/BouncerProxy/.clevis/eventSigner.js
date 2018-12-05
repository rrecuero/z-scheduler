//
// usage: node contract Signer BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Signer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
