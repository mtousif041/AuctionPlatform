import {configureStore} from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import commissionReducer from "./slices/commissionSlice";
import auctionReducer from "./slices/auctionSlice";
import bidReducer from "./slices/bidSlice";
import superAdminReducer from "./slices/superAdminSlice";

export const store = configureStore({ // ab is store ko use krna hai apne main.js me 
    reducer: {
        user: userReducer, // ye userSlice tha humne ise rename kr diya userReducer me 
        commission: commissionReducer,
        auction: auctionReducer,
        bid: bidReducer,
        superAdmin: superAdminReducer,

    },

});


//store.js banaya ->main.jsx me import kiya store ko provider ke ander ->