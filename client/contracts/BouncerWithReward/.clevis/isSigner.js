//
// usage: clevis contract isSigner BouncerWithReward
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isSigner(args[3]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
