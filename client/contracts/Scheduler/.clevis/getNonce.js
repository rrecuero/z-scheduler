//
// usage: clevis contract getNonce Scheduler
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.getNonce(args[3]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
