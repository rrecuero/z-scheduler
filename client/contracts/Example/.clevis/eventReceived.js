//
// usage: node contract Received Example
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Received', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
