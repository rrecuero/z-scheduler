//
// usage: clevis contract isOwner Scheduler
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.isOwner().call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
