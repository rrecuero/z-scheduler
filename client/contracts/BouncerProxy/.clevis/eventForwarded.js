//
// usage: node contract Forwarded BouncerProxy
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Forwarded', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
