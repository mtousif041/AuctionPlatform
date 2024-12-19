import mongoose from "mongoose";
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {Commission} from "../models/commissionSchema.js";
import {User} from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";

export const deleteAuctionItem = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){ // yaani database me id (vjsjhbsj56456465sdssdjb) jis trah se hoti hai us formate me hai ki nhai
        return next(new ErrorHandler("Invalid Id format.", 400))
    } 
    const auctionItem = await Auction.findById(id);
    
    if(!auctionItem){
        return next(new ErrorHandler("Auction not Found", 404));
    }

    await auctionItem.deleteOne();
    res.status(200).json({
        success: true,
        message: "Auction item deleted successfully.",
    })
});



export const getAllPaymentProofs = catchAsyncErrors(async(req, res, next)=>{
    let paymentProofs = await PaymentProof.find();
    res.status(200).json({
        success:true,
        paymentProofs,
    });
});



export const getPaymentProofDetail = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const paymentProofDetail = await PaymentProof.findById(id);
    res.status(200).json({
        success:true,
        paymentProofDetail,
    });
});



// ab proof ko update krna hoga 
export const updateProofStatus = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params; // ye super adminSlice ke updatePaymentProof ke line no.214 se arrha hai 
    const {amount, status} = req.body;// ye super adminSlice ke updatePaymentProof ke line no.215 se arrha hai 
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid ID Format.", 400));
    }

    //ab hume us proof ko dhundna hai hume jis proof ko update krna hai 
    let proof = await PaymentProof.findById(id);

    if(!proof){
        return next(new ErrorHandler("Payment Proof Not Found", 404));
    }

    // ab agr proof mil gya to 
    proof = await PaymentProof.findByIdAndUpdate(id, {
        // status:status, 
        status, 
        amount
    }, { // ye options hai 
        new:true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success:true,
        message:"Payment proof amount and status updated.",
        proof,
    });
});




export const deletePaymentProof = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const proof = await PaymentProof.findById(id);
    if(!proof){
        return next(new ErrorHandler("payment proof not found.", 404));
    }

    await proof.deleteOne();
    res.status(200).json({
        success:true,
        message:"Payment Proof deleted",
    })
});


export const fetchAllUsers = catchAsyncErrors(async(req, res, next)=>{
    // aggregate mongodb ka method hota hai yaani agr muje jese ki yhe janna hai ki agust me jo jo register hue hai  aise konse kitne users hai jinka role Auctioneer hai aur konse kitne hai users hai jinka role beeder hai ,isme hum User.find();ka use nhai krne wale hai
    const users = await User.aggregate([
        {
            $group: { //5:47:00 // yaani ki ek  group bnao hmare liye 
                _id: { // us group ki main key jo hai vo uski id rahegi 
                    month: {$month: "$createdAt"}, // hmare pass createdAt field hai userSchema me usme se month ko extract krke do 
                    year: {$month: "$createdAt"}, // hmare pass createdAt field hai userSchema me usme se year  ko bhi  extract kro
                    role: "$role", // aur user ke role ko bhi extract krke do 
                },
                count: {$sum: 1}, // isse ye aa jega ki matlab kitne user register hue total 
            },
        },  
        // ye group aur project pre build hote hai 
        {
            $project:{ // yaani is saal ke is mhaine me kitne user register hue , yaani ki yhe uper wale group ko reshape krne ke liye hai ya reshape kr deta  
                month: "$_id.month", // line no. 105 me jo id hai uske ander ke month ko get krna hai 
                year: "$_id.year",// line no. 105 me jo id hai uske ander ke year ko get krna hai 
                role:"$_id.role",// line no. 105 me jo id hai uske ander ke user ke role ko get krna hai 
                count: 1,
                _id: 0, // _id:0 yaani ki id ko hum as an output nhai bhej rahe hai assal me 
            },
        },
        {
            $sort: {year: 1, month: 1}, // yaani yha pr hum saal ke hisaab se sort out kr rhe hai 
        },
    ]);

   //

    const bidders = users.filter(user=>user.role === "Bidder");// yaani jo aggreagate se hmare pass jo user aaye hiana usme khuch users create honge , to humne kha ki is users array pr filter methode run kro aur vo saare users hume get krke do jiska role bidder hai , same autioneer ke liye bhi krenge 
    const auctioneers = users.filter(user=>user.role === "Auctioneer");


    const transformDataToMonthlyArray = (data, totalMonths = 12)=>{
        const result = Array(totalMonths).fill(0); // yaani jo 12 elemnet ka aaray hai usme agr khuch nhai hoga tho sabhi 12 element 0,0,0...honge 

        data.forEach(item => {
            result[item.month - 1] = item.count;

        });

        return result;
    };


    const biddersArray = transformDataToMonthlyArray(bidders);
    const auctioneersArray = transformDataToMonthlyArray(auctioneers);

    res.status(200).json({
        success: true,
      biddersArray, // like biddersArray: [0,0,0,0,0,0,0,15,0,0,0,0] 
      auctioneersArray, // like auctioneersArray: [0,0,0,3,0,0,0,1,0,0,0,0] 
    })
});


// ab hum logo ko chaiye ki hmari monthly revenu kitni generate ho gai, aur ye hume get hoga in commission wale collection , is ke liye function likenge 
export const monthlyRevenue = catchAsyncErrors(async(req, res, next)=>{
    const payments = await Commission.aggregate([
        {
            $group: {
                _id: {
                    month: {$month: "$createdAt"},
                    year: {$year: "$createdAt"},
                },
                totalAmount: {$sum: "$amount"},
            },
        },
        {
            $sort: {"_id.year": 1, "_id.month": 1 },
        },
    ]) ;
  
    const transformDataToMonthlyArray = (payments, totalMonths = 12)=>{
        const result = Array(totalMonths).fill(0);

        payments.forEach(payment => {
            result[payment._id.month -1] = payment.totalAmount;

        });

        return result;
    };

   const totalMonthlyRevenue = transformDataToMonthlyArray(payments);
   res.status(200).json({
    success: true,
    totalMonthlyRevenue,// like totalMonthlyRevenue: [0,0,0,3000,0,0,0,10000,0,1500,0,0] 
   })
})
