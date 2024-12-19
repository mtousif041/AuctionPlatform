import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    amount: Number,
    bidder: { // yaani ye bid kis bande ki hai 
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // agr hum ye reference hta bhi de to koi farak nahi padtha
            required: true,
        },
        userName: String,
        profileImage: String, // cloudinary pr jo img hai sirf aur sirf uska url yha pr de dhenge 
    },
    auctionItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction", // agr hum ye reference hta bhi de to koi farak nahi padtha
        required: true,
    }
})


export const Bid = mongoose.model("Bid", bidSchema);