//
// usage: clevis contract renounceSigner BouncerProxy ##accountindex## 
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running renounceSigner() as account ["+params.accounts[args[3]]+"]")
  return contract.methods.renounceSigner().send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
