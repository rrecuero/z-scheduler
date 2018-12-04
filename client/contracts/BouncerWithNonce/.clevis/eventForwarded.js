//
// usage: node contract Forwarded BouncerWithNonce
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Forwarded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
