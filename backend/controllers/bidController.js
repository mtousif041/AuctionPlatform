import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {Auction} from '../models/auctionSchema.js'
import { Bid } from "../models/bidSchema.js";
import { User } from "../models/userSchema.js";

export const placeBid = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found.",404));
    }
    const { amount } = req.body;

    if(!amount){
        return next(new ErrorHandler("Please place your bid.",404));
    }
   
   
    if(amount <= auctionItem.currentBid){
        return next(new ErrorHandler("Bid amount must be greater than the current bid.",404));
    }
   
   
    if(amount < auctionItem.startingBid){
        return next(new ErrorHandler("Bid amount must be greater than the starting bid.",404));
    }


    try {
        const existingBid = await Bid.findOne({ // yaani is user ne is item ke liye phele se bid kiya hai ya nhai kiya  
            "bidder.id": req.user._id, // yaani bidSchema me jo bidder hai usme jo id hai vo id brabr honi chaye req.user._id ke 
            auctionItem: auctionItem._id, // yaani jo auctionItem hai bidSchema ke ander vo brabr honi chaye auctionItem._id, auctionItem._id ye line no. 9 ka hai 
        });
        const existingBidInAuction = auctionItem.bids.find(bid => bid.userId.toString() == req.user._id.toString());
        if( existingBid && existingBidInAuction){ // yaani is user ne is item ke liye phele se bid kiya hai to fir vo aapas apni bid ko bdayega to inko inko update krdo 
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            await existingBid.save();
            await existingBidInAuction.save(); // agr aap in values ko save nhai kroge to refresh krne se dobara vahi purani vaali values aa jaayegi 
            auctionItem.currentBid = amount;
        } else{ // else means ki agr user ne phele is product ke liye bid ki hi nhai hai to ek new bid create krvana hai 
            const bidderDetail = await User.findById(req.user._id);
            const bid = await Bid.create({
                amount,
                bidder:{
                    id: bidderDetail._id,
                    userName: bidderDetail.userName,
                    profileImage: bidderDetail.profileImage?.url
                },
                auctionItem: auctionItem._id,
            });
            auctionItem.bids.push({
                userId: req.user._id,
                userName: bidderDetail.userName,
                profileImage: bidderDetail.profileImage?.url,
                amount,
            });
            auctionItem.currentBid = amount;
        }

        await auctionItem.save();

        res.status(201).json({
            success: true,
            message: "Bid placed.",
            currentBid: auctionItem.currentBid,
        })
            
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to placed bid", 500));
    }
})