import { config } from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js";
import bidRouter from "./router/bidRoutes.js";
import commissionRouter from "./router/commissionRouter.js";
import superAdminRouter from "./router/superAdminRoutes.js";
import {endedAuctionCron} from "./automation/endedAuctionCron.js";
import {verifyCommissionCron} from "./automation/verifyCommission.js";


const app = express ();
config({
    path:"./config/config.env",
});



//apne frontend aur backend ko aapas me  connect krne ke liye ek package use krna hai cors
app.use(cors({
    // origin:[process.env.FRONTEND_URL],
    origin:'http://192.168.43.226:5173',
    methods:["POST", "GET", "PUT", "DELETE"], // manlo agr aapne PUT aur DELETE methods yha se hta diye to ab aap apne frontend me put aur delete methode ko use nhai kr paaoge , cors error aayega 
    credentials:true, 
}));


// ek chota sa middleware
app.use(cookieParser()); // cookieParser kiya krta hai ki cookies ko store karvaane ka kaam krta haai, agr aap cookieParser ka use nhai kroge to aapke cookies to generate honge but aap une backend me access nhai kr paaoge 

app.use(express.json()); //  ye hmare pass jo data hai usko return krta hai json formate me 

app.use(express.urlencoded({extended:true})); // ye ye kaam krta hai ki maanlo aapne ek field bnai hai number formate ke liya aur aap agr ab aap usme array bhej rhe ho to ye error de deta

app.use(fileUpload({ // ye alternative hai multer ka, multer se aap files ko yehi backend/storage me bhi store kr shakte ho, but hum multur ki jagha file upload ka use kr rhe hai 
    useTempFiles:true,
    tempFileDir: "/tmp/",
})); 


//isko database se phele likhna hai 
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/superadmin", superAdminRouter);


// calling cron for automation
endedAuctionCron();
verifyCommissionCron();

///connecting to db
connection();


///ErrorHandling
app.use(errorMiddleware) // yha pe humko isko call nhai krna app.use(errorMiddleware()) varna error dega , yha pr hum ye mension krte hai ki agr koi error aaya tab hi ye exicute hoga 



export default app;