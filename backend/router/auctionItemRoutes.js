import express from "express";
import {addNewAuctionItem, getAllItems, getAuctionDetails, getMyAuctionItems, removeFromAuction, republishItem} from "../controllers/auctionItemController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js";

const router = express.Router();

router.post("/create", isAuthenticated, isAuthorized("Auctioneer"), trackCommissionStatus, addNewAuctionItem); // yha se humne bhej diya Auctioneer ko apne auth.js me isAuthorized ko 
router.get("/allitems", getAllItems);  
router.get("/auction/:id", isAuthenticated, getAuctionDetails);  
router.delete("/delete/:id", isAuthenticated, isAuthorized("Auctioneer"), removeFromAuction);  
router.put("/item/republish/:id", isAuthenticated, isAuthorized("Auctioneer"), republishItem);  
router.get("/myitems", isAuthenticated, isAuthorized("Auctioneer"), getMyAuctionItems);  


export default router; // ab is router.js ko bhi setup krna hai app.js me tab ye jaake kaam krega 

