import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title: String,
    description: String,
    startingBid: Number,
    category: String,
    condition: {
        type: String,
        enum: ["New", "Used"],
    },
    currentBid: {type: Number, default: 0},
    startTime: String, // yaani auction start aur end kab hoga 
    endTime: String, //iske liye yha pr humne type string used ki hai Date humne  kyunki Date se hmare pass iso format me date aarahi 
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    createdBy: {
        type : mongoose.Schema.Types.ObjectId, // isse hmare pass ek object id store hogi 
        ref: "User", // yaani apke dabase me User naam ka jo collection hai  // agr hum ye reference hta bhi de to koi farak nahi padtha
        required: true,
    },
    bids: [ // jab bhi koi user bid krega bid ki details isme add ho jaayegi 
        {
            userId: {
                type : mongoose.Schema.Types.ObjectId,
                ref: "Bid", // agr hum ye reference hta bhi de to koi farak nahi padtha
            },
            userName: String,
            profileImage: String, // ye profile dobara upload krne ki jaaroorat nhai ye hume cloudinary se mil jaayegi 
            amount: Number, // yaani is user ne jo bid lgai hai uski ammount kiya hai 

        }
    ],
    highestBidder: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User", // agr hum ye reference hta bhi de to koi farak nahi padtha
    },
    commissionCalculated: { // yyani jab auction complelete ho jayega to higest bidder ka 5% issme aad hoga automation se // aur ye commisison wali value yha pr store nhai hogi iske liye ek alag schema hoga 
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
});

export const Auction = mongoose.model("Auction", auctionSchema);
