//
// usage: node contract Signer SignatureBouncer
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('Signer', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
