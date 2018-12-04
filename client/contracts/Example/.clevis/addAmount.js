//
// usage: clevis contract addAmount Example ##accountindex## amount
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running addAmount("+args[4]+") as account ["+params.accounts[args[3]]+"]")
  return contract.methods.addAmount(args[4]).send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
