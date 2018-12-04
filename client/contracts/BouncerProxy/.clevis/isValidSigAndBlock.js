//
// usage: clevis contract isValidSigAndBlock BouncerProxy
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isValidSigAndBlock(args[3],args[4],args[5],args[6],args[7],args[8],args[9],args[10]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
