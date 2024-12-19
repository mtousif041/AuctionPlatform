import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import {PaymentProof} from "../models/commissionProofSchema.js";
import {User} from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary"; // v2 as cloudinary ye cloudinary ka advanced version hota hai i think 
import mongoose from "mongoose";

export const calculateCommission = async (auctionId) =>{ // ye auctionId endedAuctionCrone.js se aarhai hai , line no.22 se
    const auction = await Auction.findById(auctionId);

    if(!mongoose.Types.ObjectId.isValid(auctionId)){
        return next(new ErrorHandler("Invalid Auction Id formate.", 400));
    }

    const commissionRate = 0.05; // means ki 0.05*100 = 5% , hai ye 
    const commission = auction.currentBid * commissionRate; //currentBid means jo higehst bid hogi jis auction ke liye 
    return commission; 
};

export const proofOfCommission = catchAsyncErrors(async(req, res, next)=>{
    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Payment Proof ScreenShot required.", 400));
    }

    const {proof} = req.files;
    const {amount, comment} = req.body; 
    const user = await User.findById(req.user._id);

    if(!amount || !comment){
        return next(new ErrorHandler("Amount and comment are required fields.", 400));
    }

    if(user.unpaidCommission === 0){ //yaani ki agr user ke unpaidCommission phele se zero hai aur vo hame screen shot bhejne ki kosis krega to hum use phele return krva dhenge aur niche likha hai vo bol dhenge 
        return res.status(200).json({
            success: true,
            message: "you dont have any unpaid commission."
        });
    }
        
        
    if(user.unpaidCommission < amount){
        return next(new ErrorHandler(`The amount exceeds your unpaid commission balance. please enter an amount upto ${user.unpaidCommission}.`, 403));
    }


    const allowedFormats = ["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(proof.mimetype)){ // mimetype means extension jpeg png ....
     return next(new ErrorHandler("Screen shot formate not supported", 400));
    }
        

    const cloudinaryResponse = await cloudinary.uploader.upload(proof.tempFilePath, {
        folder: "MERN_AUCTION_PAYMENT_PROOFS",  // yaani ye saari images is naam  ke folder me cloudinary me store hongi 
    });

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error.");

        return next(new ErrorHandler("Faild to upload payment proof.", 500));
    }
 
    // ab img bhi agr upload ho chuki hai to 
    const commissionProof = await PaymentProof.create({
        userId: req.user._id,
        proof:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        amount,
        comment,
    });

    res.status(201).json({
        success:true,
        message: "Your proof has been submitted successfully. we will review it and response to you with in 24 hours",
        commissionProof,
    });
        
        
})