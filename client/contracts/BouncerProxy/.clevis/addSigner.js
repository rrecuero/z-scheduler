//
// usage: clevis contract addSigner BouncerProxy ##accountindex## account
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running addSigner("+args[4]+") as account ["+params.accounts[args[3]]+"]")
  return contract.methods.addSigner(args[4]).send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
