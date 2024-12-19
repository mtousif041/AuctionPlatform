// ye ek chota sa middleware hai jo async await ke error ko handle krne ke liye  middleware bnaynge , aur jo errors humne handle nhai kiye ho ye usko bhi catch krle 
export const catchAsyncErrors = (theFunction)=>{ // ye accept krta hai ek pure function ko
   return(req, res, next)=>{
    Promise.resolve(theFunction(req, res, next)).catch(next) // yaani is promise ke ander jo bhi function ya code hoga usko tum resolve krdo ya run krdo.agr resolve nhai hua to hume krna hai catch , catch kiya krega ki vo us error ko catch krlega aur use aage next kr dega yaani use aage proceed krega , usse aage error ka middleware aatha hai ye use agge move on krrega
    // theFunction accept krta hai 3 parameter
   }
} 