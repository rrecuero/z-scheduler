//
// usage: node contract Signer BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Signer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
