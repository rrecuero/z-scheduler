//
// usage: clevis contract isMinter SomeToken
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isMinter(args[3]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
