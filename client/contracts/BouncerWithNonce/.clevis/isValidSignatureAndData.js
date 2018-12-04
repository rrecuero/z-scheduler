//
// usage: clevis contract isValidSignatureAndData BouncerWithNonce
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isValidSignatureAndData(args[3],args[4]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
