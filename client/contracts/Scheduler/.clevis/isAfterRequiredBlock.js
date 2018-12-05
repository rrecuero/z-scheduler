//
// usage: clevis contract isAfterRequiredBlock Scheduler
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isAfterRequiredBlock(args[3]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
