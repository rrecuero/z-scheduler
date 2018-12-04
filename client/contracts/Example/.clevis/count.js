//
// usage: clevis contract count Example
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.count().call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
