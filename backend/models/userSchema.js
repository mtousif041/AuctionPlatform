import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema  = new mongoose.Schema({
    userName: {
        type: String,
        minLength: [3, "Username must contains atleast 3 characters."],
        maxLength: [40, "Username cannot exceed 40 characters."]
    },
    password:{
        type: String,
        selected: false,
        minLength: [8, "password must contains atleast 8 characters."],      
    },
    email: String,
    address: String,
    phone: {
        type: Number,
        minLength: [10, "password must contains atleast 10 characters."],
        maxLength: [10, "password cannot exceed 10 characters."]
    },
    profileImage:{
        public_id: { // cloudinary me se aayega 
            type: String,
            required: true,
        },
        url: {// cloudinary me se aayega 
            type: String,
            required: true,
        },
    },
    paymentMethods: {
        bankTransfer: {
            bankAccountNumber: String,
            bankAccountName: String,
            bankName: String,
        },
        easyrupees:{
            easyrupeesAccountNumber: Number,
        },
        paypal: {
          paypalEmail: String,
        },

    },
    role:{
        type:String,
        enum: ["Auctioneer", "Bidder", "Super Admin"]
    },
    unpaidCommission: {
        type: Number,
        default: 0,
    },
    auctionswon: { // yaani isne kitni auctions jeeti hai 
        type: Number,
        default: 0,
    },
    moneySpent:{ // yaani is bande ne auction me kitna paisa udaya hai 
        type: Number,
        default: 0, 
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },

});

// hum yha pe password ko hash kr lenge 
userSchema.pre("save", async function(next){ // yaani save krne se phele ye function ko run krdo
    if(!this.isModified("password")){// agr password modified nhai hua hai to next kr do yaani is function ko aage chalaane ki koi jaroorat nhai hai 
        next()
    }
    this.password = await bcrypt.hash(this.password, 10); // agr password ko modified kiya hai to ye krdo //10,8,12,14
});//this se kiya hoga ki humne jo instance/object bnaya hai userSchema ka aur yha pr line no.72 me humne usko use kiya hai userSchema.pre krke to aap this keyword ka use krke ke rahe ho ki me userSchema ke password field ko access kr rha hu , aur ye this keyword pre hook ya instance methode me use krte hai jese humne kiya hai uper aur niche waali method me 


// ab jab user passwoed ko enter krega yaani user loggin krega to usko compare krna pdega 
userSchema.methods.comparePassword = async function(enteredPassword){ // comparePassword ko aaap khuch bhi naam de shakte ho
    return await bcrypt.compare(enteredPassword, this.password); //this.password vo password hoga jise aap hased kr chuke ho
};
    

userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, { // {id: this._id} yaani jo user login hua hai uski id ko aapne store kiya hai ek id naam ke variable me aur us id ka us krke aapne ek token ko generate kiya hai secret_key ka use krthe hue aur sign method ye check krta ha ki user trusted server se aaya hai ya nhai 
        expiresIn: process.env.JWT_EXPIRE,
    })
}

export const User = mongoose.model("User", userSchema);