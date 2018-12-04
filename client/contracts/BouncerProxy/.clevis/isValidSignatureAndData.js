//
// usage: clevis contract isValidSignatureAndData BouncerProxy
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isValidSignatureAndData(args[3],args[4]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
