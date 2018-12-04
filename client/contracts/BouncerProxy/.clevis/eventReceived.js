//
// usage: node contract Received BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Received', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
