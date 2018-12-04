//
// usage: clevis contract nonce BouncerProxy
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.nonce(args[3],args[4]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
