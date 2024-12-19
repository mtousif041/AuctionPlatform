import mongoose from "mongoose";

export const connection = ()=>{
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "MERN_AUCTION_PLATFORM", // isme aap bichme space nhai dhe skte hai, aur database ka bhi yehi name hona Chaye
    }).then(()=>{
        console.log("Connected to database");
        
    }).catch((err)=>{
        console.log(`Some error occured while connecting to database: ${err}`);
        
    });
};