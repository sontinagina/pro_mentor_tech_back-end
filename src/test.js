async function func(){
  console.log("1")
  const result = await new Promise((resolve,reject) => setTimeout(() => reject('9'),3000)).catch((e)=>{
    console.log("err   :",e)
  })

  const result1 = await new Promise((resolve,reject) => setTimeout(() => resolve('2'),10000))
console.log(result1)
  console.log("3")
console.log("4")
}


func();