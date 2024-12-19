import mongoose from "mongoose";

const paymentProofSchema = new mongoose.Schema({
    userId: { // yaani jo user pay kr rha hai 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // agr hum ye reference hta bhi de to koi farak nahi padtha
        required: true
    },
    proof:{ // payment ho jaane ke baad proof ke liye useee screen shot bhejna hoga  jise hum cloudinary pr upload krva kr ye sab le lenge 
        public_id: {
             type: String,
             required: true,
        },
        url: {
             type: String,
             required: true,
        },
    },
    uploadedAt:{
        type: Date,
        default:Date.now,
    },
    status: { // statu ko sirf admin hi change kr shakta hai , proof aane ke baad 
        type: String,
        default: "Pending",
        enum: ["Pending", "Approved", "Rejected", "Settled"],
    },
    amount: Number,
    comment: String,

});

export const PaymentProof = mongoose.model("PaymentProof", paymentProofSchema);