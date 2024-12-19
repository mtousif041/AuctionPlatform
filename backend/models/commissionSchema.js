//commissionProof ko verify krne ke baad , automation ke jariye automattically jo commision hogi  vo hum yha  create kr dhenge 
import mongoose from "mongoose";


const commissionSchema = new mongoose.Schema({
    amount: Number,
    user: mongoose.Schema.Types.ObjectId,
    createdAt:{
        type: Date,
        default: Date.now,
    },
});


export const Commission = mongoose.model("Commission", commissionSchema);