// const user = req.user; // jab user login ho gya hai to usko kese get krunga , ise middleware se krenge isAuthendicated

import {User} from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";

export const isAuthenticated = catchAsyncErrors(async(req, res, next)=>{
    // ab isme hum subse phele user ka token get krna hai jo cookies me store hua tha ,  jo  user loggin hua hai uska
    const token = req.cookies.token; //yyani cookies ke ander jo token hai uske liye mene request ki ya get krliya  , agr aap app.js me is cheez ko use nhai krte app.use(cookieParser()); to aap is value ko get nhai kr paaoge 

    if(!token){//mathlab user login nhai hai 
        return next(new ErrorHandler("User Not authenticated.", 400));
    }

    //agr user authenticated hua to ye krenge yaani use token mil gya 
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // verify ye kaam krta hai ki jo token hai vo isi secret key se generate hua hai ya kisi aur se/ kunyki agr cookies me do token hue ek is website ka aur dusra dusri kisi website ka 

    req.user = await User.findById(decoded.id); // ab aap req.user me puree user ko set krdo taaki ab aap use req.user krke access kr pao 
    //decoded.id yaani ab ye decoded ke ander id kha se aai to ye userSchema me aapne generateJson WebToken krvaya hai jwt.sign me aapne jo payload me jo id diya hai ,  
    next();

});


export const isAuthorized = (...roles)=>{ // ye 3 dots isliye hai ithink knyuki hum routes se string ko bhej rhe hai , ithink ye string ke liye hai 
  return (req, res, next)=>{
    if(!roles.includes(req.user.role)){//roles.includes yaani jo roles yha pr aaya hai route se aur req.user.role yaani jo user ka role hai yaani vo match ho rhe hai yaani roles me ye role includes hai ya nhai // yaani agr ander wali string bhar wali string me nhai hui to ye error return kr dena hai 
        return next(new ErrorHandler(`${req.user.role} note allowed to access this resource.`, 403));
    }
    next();
  }
}