//
// usage: clevis contract owner Scheduler
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.owner().call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
