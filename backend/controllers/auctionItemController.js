import {Auction} from "../models/auctionSchema.js";
import {User} from "../models/userSchema.js";
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";
import { Bid } from "../models/bidSchema.js";


export const addNewAuctionItem = catchAsyncErrors(async(req, res, next)=>{
    if(!req.files || Object.keys(req.files).length === 0){ // yaani agr file nhai hui yaa fir file to hai lekin file me koi object nhai hai to ye return krna hai 

        // return res.status(404).json({ // is itna lamba error ka hum middleware bna lete hai , in middleware folder 
        //     success: false,
        //     message: "Auction item image required",
        // })
        
        return next(new ErrorHandler("Auction item image required", 400))// uper wale itne bde error ko humne simple error handler middeleware bna ke return krva diya , ab hum sub jagha pe aaise hi error ko return krvayenge 
      }
    
        const { image } = req.files;  // auctionSchema me humne image diya hua 
    
        const allowedFormats = ["image/png","image/jpeg","image/webp", "image/gif"];
    
        if(!allowedFormats.includes(image.mimetype)){ // mimetype means extension jpeg png ....
         return next(new ErrorHandler("File format not supported", 400));
        }


        const {title, description, category, condition, startingBid, startTime, endTime } = req.body;

        if( !title ||
            !description ||
            !category ||
            !condition ||
            !startingBid ||
            !startTime ||
            !endTime 
        ){
            return next(new ErrorHandler("Please provide All Details", 400))
        }

        if(new Date(startTime) < Date.now()){ // new Date(startTime) yaani hmare pass jo start time hai string formate me hoga humne phele to use new Date ke through Date formate me convert kr liya 
            return next(new ErrorHandler("Auction Starting time must be greater than present time .", 400));
        }
       
       
        if(new Date(startTime) >= new Date(endTime)){ // yaani end time ki value hmesa start time se jyaada honi chaiye 
            return next(new ErrorHandler("Auction Starting time must be less than ending time .", 400));
        }

        const alreadyOneAuctionActive = await Auction.find({ // yaani agr kisi ne ek auction dala hai aur vo abi tak complete nhai hua hai to user dusra auction nhai daal shakta hai 
            createdBy: req.user._id,  // yaani ki jo createdBy me id hogi agr vo us current user ki id se match ho gayi to usko find kro 
            endTime: {$gt: Date.now() }, // aur fir usme check kro ye ki agr endTime greater hai current time se 
        });
        //  console.log(alreadyOneAuctionActive);
         
        if(alreadyOneAuctionActive.length > 0){
            return next(new ErrorHandler("You already have one active auction", 400)); //agr unPaidCommission true hua tab bhi aap new auction create nhai kr shakte uske liye alag se middleware bnayenge 
        }

        try {  //ab cloudinary pr images ko store krva dete hai 
            const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: "MERN_AUCTION_PLATFORM_AUCTIONS",  // yaani ye saari images is naam  ke folder me cloudinary me store hongi 
            });
    
            if(!cloudinaryResponse || cloudinaryResponse.error){
                console.error("cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error.");
    
                return next(new ErrorHandler("Faild to upload auction image to cloudinary.", 500));
            }
            
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            // console.log(req);
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            // console.log(req.body);
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            
            // console.log(req.user);
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            // console.log(req.user._id);
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            // console.log(req.files);
            // console.log("/////////////////////////////////////////////////////////////////////////////////////////////");
            
            const auctionItem = await Auction.create({
                title, 
                description, 
                category, 
                condition, 
                startingBid, 
                startTime, 
                endTime,
                image: {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url
                },
                createdBy: req.user._id,
            });
            return res.status(201).json({
                success: true,
                message: `Auction Item created and will be listed on auction page at ${startTime}`,
                auctionItem,
            });
     
        } catch (error) {
            return next(new ErrorHandler(error.message || "Failed to create auction.", 500));
        }
    });


export const getAllItems = catchAsyncErrors(async(req, res, next)=>{
    // console.log(req.user);
    // console.log(req.user._id); //ye dono log tab hi kaam krenge jab tum is function ke route me isAuthenticated lagaoge knuyki ye user aur user id isAuthenticated middleware me set kiye gye hai 
    
    let items = await Auction.find();
    res.status(200).json({
        success: true,
        items,
    })
});  




export const getAuctionDetails = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params; // yaani isse jo url me id hogi vo get ho jaayegi
    // console.log(id);
    
    if(!mongoose.Types.ObjectId.isValid(id)){ // yaani database me id (vjsjhbsj56456465sdssdjb) jis trah se hoti hai us formate me hai ki nhai, ye methode mongoose me hi aata hhai 
        return next(new ErrorHandler("Invalid Id format.", 400))
    } 
    // console.log(id, id);
    const auctionItem = await Auction.findById(id);
    
    if(!auctionItem){
        return next(new ErrorHandler("Auction not Found", 404));
    }
    const bidders = auctionItem.bids.sort((a, b) => b.amount - a.amount); //yaani jisne jyada lgaye hai uska naam phele aana chaye 
    res.status(200).json({
        success:true,
        auctionItem,
        bidders,
    })
});


export const getMyAuctionItems = catchAsyncErrors(async(req, res, next)=>{
    const items = await Auction.find({createdBy: req.user._id});
    res.status(200).json({
        success: true,
        items,
    })
});


export const removeFromAuction = catchAsyncErrors(async(req, res, next)=>{
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


export const republishItem = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){ // yaani database me id (vjsjhbsj56456465sdssdjb) jis trah se hoti hai us formate me hai ki nhai
        return next(new ErrorHandler("Invalid Id format.", 400))
    } 
    let auctionItem = await Auction.findById(id);
    
    if(!auctionItem){
        return next(new ErrorHandler("Auction not Found", 404));
    }
    if(!req.body.startTime || !req.body.endTime){
        return next(new ErrorHandler("StartTime and EndTime for republish is mandatory."))
    }

    if(new Date(auctionItem.endTime) > Date.now()){
        return next( new ErrorHandler("Auction is already active cannot republish", 400));
    }

    let data = {
        startTime: new Date(req.body.startTime), //vo string formate me enter krega hum use yha date formate me khud convert kr dhenge 
        endTime: new Date(req.body.endTime),
    };

    if(data.startTime < Date.now()){
        return next(new ErrorHandler("Auction starting time must be greater than present time", 400))
    }


    if(data.startTime >= data.endTime){
        return next(new ErrorHandler("Auction starting time must be less than ending time", 400))
    }

    if(auctionItem.highestBidder){
        const highestBidder = await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent -= auctionItem.currentBid;
        highestBidder.auctionswon -= 1;
        highestBidder.save();
    }

    // jab auction end ho jayega to commissionCalculated ko bhi wapas false  kra dete hai  aur bid array ko bhi vapas khali kr dete hai 
    data.bids = []; // ye jo humne uper new veriable let data create kiya hai iske ander khuch naye variable ko add krenge 
    data.commissionCalculated = false;
    data.currentBid = 0;
    data.highestBidder = null;
    auctionItem = await Auction.findByIdAndUpdate(id, data, { //ye subse phele mangta hai us auction ki id jisko update krna hai aur fir data jo update krna hai 
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    await Bid.deleteMany({auctionItem: auctionItem._id }) // to ye un saare auction item ki bids ko delete kr dega jisko hum republish krva rahe hai 

    const createdBy = await User.findByIdAndUpdate(req.user._id, {unpaidCommission: 0}, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    res.status(200).json({
        success: true,
        auctionItem, 
        message: `Auction republished and will be active on ${req.body.startTime}`,
        createdBy
    })




});    

