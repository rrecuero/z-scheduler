//
// usage: clevis contract schedule Scheduler ##accountindex## destination value data nonce rewardToken rewardAmount minBlock
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running schedule("+args[4]+","+args[5]+","+args[6]+","+args[7]+","+args[8]+","+args[9]+","+args[10]+") as account ["+params.accounts[args[3]]+"]")
  return contract.methods.schedule(args[4],args[5],args[6],args[7],args[8],args[9],args[10]).send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
