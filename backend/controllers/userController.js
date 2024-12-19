import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary"
import { generateToken } from "../utils/jwtToken.js";



/// yha pr humne catchAsyncErrors ka use isliye kiya hai taaki har async function ke liye try-catch likhne ki jaroorat na pde
export const register = catchAsyncErrors(async (req, res, next)=>{ // humne is function ko catch async errors me me wrap kr diya 
  if(!req.files || Object.keys(req.files).length === 0){ // yaani agr file nhai hui yaa fir file to hai lekin file me koi object nhai hai to ye return krna hai 

    // return res.status(404).json({ // is itna lamba error ka hum middleware bna lete hai , in middleware folder 
    //     success: false,
    //     message: "Profile image required",
    // })
    
    return next(new ErrorHandler("Profile image required", 400))// uper wale itne bde error ko humne simple error handler middeleware bna ke return krva diya , ab hum sub jagha pe aaise hi error ko return krvayenge 
  }

    const {profileImage} = req.files; // profileImage userSchema se match krni chaye 

    const allowedFormats = ["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(profileImage.mimetype)){ // mimetype means extension jpeg png ....
     return next(new ErrorHandler("File format not supported", 400));
    }

    const {userName, email, password, phone, address, role, bankAccountNumber,
        bankAccountName, bankName, easyrupeesAccountNumber, paypalEmail} = req.body;


        if(!userName || !email || !password || !phone || !address || !role){
            return next(new ErrorHandler("please fill full form", 400));
        }

         //ab agr uper ka pura form fill kr liya to fir ye check kro 
        if(role === "Auctioneer"){
            if(!bankAccountName || !bankAccountNumber || !bankName){
                return next(new ErrorHandler("Please Provide your full bank details", 400));
            }
            if(!easyrupeesAccountNumber){
                return next(new ErrorHandler("Please Provide your easyrupeesAccountNumber", 400));
            }
            if(!paypalEmail){
                return next(new ErrorHandler("Please Provide your paypalEmail", 400));
            }
        }

        const isRegistered = await User.findOne({email});

        if(isRegistered){
            return next(new ErrorHandler("user already registered", 400));
        }
         
        //ab yha se hum sidhe cloudinary pr file upload kr dete hai 
        const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, {
            folder: "MERN_AUCTION_PLATFORM_USERS",  // yaani ye saari images is naam  ke folder me cloudinary me store hongi 
        });
        //tempFilePath means ki cloudinary pr upload hone se phele ye hmare server local storage me store hota hai fir vha se cloudinary pr upload hota hai 

        //agr cloudinaryResponse nhai aaya to 
        if(!cloudinaryResponse || cloudinaryResponse.error){
            console.error("cloudinary error:", cloudinaryResponse.error || "Unknown cloudinary error.");

            return next(new ErrorHandler("Faild to upload profile image to cloudinary.", 500));
        }

        //ab manlo ki image successfully upload ho chuki hai abhi tak koi error nhai aaya hai , ab hume user ki details ko store krna hai database me 
        const user = await User.create({ //const user = await User. isse kiya hoga ki user ke ander  userSchema ki saari cheeje aa chuki hai uske fields, uske  methods bhi jo humne userSchema me create kiye the , const user = await User.create({ iski vajaha se
            // ye capital User models  ke liye hai jo humne user schema me create kiya hai 
            
            userName:userName, 
            email, 
            password, 
            phone, 
            address, 
            role,
            profileImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            
             // payments methode ke liye ye krna hai 
            paymentMethods: {
                bankTransfer: {
                    bankAccountNumber,
                    bankAccountName,
                    bankName,
                },
                easyrupees:{
                    easyrupeesAccountNumber,
                },
                paypal: {
                  paypalEmail,
                },
        
            },
        });


        // ab jab user register ho jayega to usko login to krvana hai ki vo login ho jaaye , to ab token ko generate krna hai aur usko cookies me save karva dena 
        //// to yha se ab ye data lekr ke jwtToken.js me bhejenge aur yha pr token generate ho jaayega 
        generateToken(user, "User registered successfully", 201, res ) //from jwtToken.js // ye jo user humne bheja hai ab iske ander userSchema ki saari cheeje aa chuki hai uske methods bhi jo humne userSchema me create kiye the , const user = await User.create({ iski vajaha se 
                 // Or / ya 
        // res.status(201).json({
        //     success:true,
        //     message: "User Register succesfully."
        // })





});


/////////////////////////////now for login  /// yha pr humne catchAsyncErrors ka use isliye kiya hai taaki har async function ke liye try-catch likhne ki jaroorat na pde
export const login = catchAsyncErrors(async (req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please fill full form."));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next (new ErrorHandler("invalid credentials.", 400));
    }


    const isPasswordMatch = await user.comparePassword(password);    //ye comparePassword wala function userSchema ase aarha hai// aur comparePassword(password) ye jo password hai line no. 119 se arha hai  
    if(!isPasswordMatch){
        return next(new ErrorHandler("invalid credentials.", 400));
    }

    // ab agr user bhi mil gya aur password bhi match ho gya 
    generateToken(user, "Login Successfully", 200, res); // to yha se ab ye data lekr ke jwtToken.js me bhejenge aur yha pr token generate ho jaayega 
});


////////////////////////////////for get my profile details
export const getProfile = catchAsyncErrors(async (req, res, next)=>{
    // console.log(req.user._id);
    
    const user = req.user; // jab user login ho gya hai to usko kese get krunga , ise middleware se krenge isAuthendicated middleware auth.js me check kro 
    res.status(200).json({
        success: true,
        user,
    })

});


///////////////////////////for logout 
export const logout = catchAsyncErrors(async (req, res, next)=>{
    res.status(200).cookie("token", "", {//yaani token empty ho jaaye 
        expires: new Date(Date.now()), // ye options hote hai , yaani abhi ke abhi is cheez ko expire krdo 
        httpOnly: true //
    }).json({
        success:true,
        message:"Logout Successfully.",
    
    });  
});



export const fetchLeaderboard = catchAsyncErrors(async (req, res, next)=>{
    // yaani subse jyaada kis ne paisa auction me khrch kiya hai 
    const users = await User.find({moneySpent: {$gt: 0}}); //yaani aap us user ko find kro jisne kumse kum ek rupya to kharch kiya ho 
    const leaderboard = users.sort((a,b)=>b.moneySpent - a.moneySpent); // ye function kiya krega ki phele user aur dusre user ki jo money spent hai unko aapas me minus krega aur jiski jayada aayegi usko upr rhak dega , aur array formate ke ander data saara store ho jayega 
    res.status(200).json({
        success:true,
        leaderboard,
    })
});