//
// usage: clevis contract owner BouncerWithNonce
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.owner().call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
