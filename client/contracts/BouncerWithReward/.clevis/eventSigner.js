//
// usage: node contract Signer BouncerWithReward
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Signer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
