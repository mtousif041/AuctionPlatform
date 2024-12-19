import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {toast} from "react-toastify";


const commissionSlice = createSlice({
    name: "commission",
    initialState:{
        loading: false,
    },
    reducers:{
        postCommissionProofRequest(state, action){
            state.loading = true;

        },
        postCommissionProofSuccess(state, action){
            state.loading = false;
        },
        postCommissionProofFailed(state, action){
            state.loading = false;
        },
    },
});


export const postCommissionProof = (data)=>async(dispatch)=>{ //101 ye data//  postCommisionProof.jsx ke line no.25 se aarha hai 
    dispatch(commissionSlice.actions.postCommissionProofRequest());
    try {
        // const response = await axios.post("http://localhost:5000/api/v1/commission/proof", data, {
        const response = await axios.post("http://192.168.43.226:5000/api/v1/commission/proof", data, {//101 ye data same hai 
            withCredentials: true,
            headers:{
                "Content-Type": "multipart/form-data"
            },
        }  );

        dispatch(commissionSlice.actions.postCommissionProofSuccess());
        toast.success(response.data.message); // ye waala data backend se aarha hai 
    } catch (error) {
        dispatch(commissionSlice.actions.postCommissionProofFailed());
        toast.error(error.response.data.message);
    }
};


export default commissionSlice.reducer; //ab isko store.js me jaker ke isko import krva lo