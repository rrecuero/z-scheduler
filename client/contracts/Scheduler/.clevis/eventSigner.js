//
// usage: node contract Signer Scheduler
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Signer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
