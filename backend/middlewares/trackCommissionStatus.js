// ye miidleware ye kaam krega ki jo auctioneer hai jisko auction ke item ko host krna hai kiya uska koi aisa unpaid commision rheta hai kiya nahi rheta , agr rheta hai to ye usko aage jaane se rok dega yaani tum host nhai kr shakte ho 
import {User} from '../models/userSchema.js'
import {catchAsyncErrors} from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../middlewares/error.js'


export const trackCommissionStatus = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.user._id);
    if(user.unpaidCommission > 0){
        return next(new ErrorHandler("You have unpaid commissions . please pay them before posting a new auction.", 403));
    }

    next();
})