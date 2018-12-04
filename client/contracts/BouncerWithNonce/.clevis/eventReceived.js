//
// usage: node contract Received BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Received', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
