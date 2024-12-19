import cron from "node-cron";  
import {Auction} from "../models/auctionSchema.js";
import {User} from "../models/userSchema.js";
import { calculateCommission } from "../controllers/commissionController.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const endedAuctionCron = ()=>{ // is function ko app.js me call kr lenge 
    cron.schedule("*/1 * * * *", async()=>{ // yaani ab ye execute hoga har ek minut ke baad // * * * * * mint hours days month years ko represent krte hai 
        const now = new Date();
        // console.log("Cron for ended auction running...");

        // ab hume un auction ko get krna hai jo ended ho chuke hai 
        const endedAuctions = await Auction.find({
            endTime: {$lt: now}, // yaani un auction ko find kro jinka endTime current time se kum ho yaani jo auction end ho chuke ho 
            commissionCalculated: false, // aur commissionCalculated ki value  false honi cahye knyki agr ye crone ek baar jis commission calculated ke liye run ho chuka ho uske liye dobara ye crone run na ho   
        });

        //ye for of loop hai 
        for(const auction of endedAuctions){
            try {
                const commissionAmount = await calculateCommission(auction._id);
                // console.log(commissionAmount);
                
                auction.commissionCalculated = true;
                const highestBidder = await Bid.findOne({
                    auctionItem: auction._id,
                    amount: auction.currentBid,
                });

                const auctioneer = await User.findById(auction.createdBy);
                auctioneer.unpaidCommission = commissionAmount;//yaani auctioneer ke jo unpaidCommission hai unko commissionAmount krdo, commissionAmount jo hume return hua hai calculateCommission se commissionController se jo ki commission return ho rha hai 
                if(highestBidder){  //agr hmko  highest bidder mil gya to 
                    auction.highestBidder = highestBidder.bidder.id;
                    await auction.save();
                   
                    // ab us bidder ko dhundna hai jisne bidding ki thi 
                    const bidder = await User.findById(highestBidder.bidder.id);
                    
                    await User.findByIdAndUpdate(bidder._id, {
                        $inc: { // inc means increament 
                            moneySpent: highestBidder.amount, // yaani jo pichla moneyspent tha usme aur highestBidder.amount ko add krdo
                            auctionswon: 1, //aur jo picle auctions won the usme ek aur add krdo // ye increament inc ki vajaha se dirctly ho rha hai 
                        },
                        
                    },{new: true});

                    await User.findByIdAndUpdate(auctioneer._id, {
                        $inc:{ // inc means increment , aur decrement ke liye bhi yehi used hoga inc but toda alg tarike se 
                            unpaidCommission: commissionAmount
                        }
                    },
                    {new: true}
                );
                const subject =  `Congratulations! you won the auction for ${auction.title}`;
                const message =  `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n2. **Easypaise**:\n- You can send payment via Easypaise: ${auctioneer.paymentMethods.easypaisa.easypaisaAccountNumber}\n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nZeeshu Auction Team`;
                console.log("sending email to highest bidder");
                
                sendEmail({email: bidder.email, subject, message});
                console.log("SUCCESSFULLY EMAIL SEND TO HIGHEST BIDDER");
                
            } else{ //agr higest bidder nahi milta to 
                await auction.save();
            }

            } catch (error) {
                return next(console.error(error || "Some error in ended auction cron")
                );
            }
        }
    });
};
        

