// i think jitne controller.js ya route.js hai backend me utne slice bnege  utne slice bnege  like userSlice , bidSlice,....so..on
import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {toast} from "react-toastify";

const userSlice = createSlice({
    name: "user", //koi bhi name de shaakte ho , but name dena jaaroory hai 
    initialState: {
        loading: false,
        isAuthenticated: false,
        user: {}, //user initially loggin nhai hoga to uski details empty hi rahegi 
        leaderboard: [],
    },

    // user ke register ke liye function bnane hai 
    reducers:{
        registerRequest(state, action){
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        registerSuccess(state, action){
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;//101
        },
        registerFailed(state, action){
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },
 /////////////////////////////////////////////////////////////////////////////////////////////////////

 loginRequest(state, action){
    state.loading = true;
    state.isAuthenticated = false;
    state.user = {};
},
loginSuccess(state, action){
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload.user;  //101
},
loginFailed(state, action){
    state.loading = false;
    state.isAuthenticated = false;
    state.user = {};
},
////////////////////////////////////////////////////////////////////////////
fetchUserRequest(state, action){
    state.loading = true;
    state.isAuthenticated = false;
    state.user = {};
},
fetchUserSuccess(state, action){
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload;// 1000 // yha pr action.payload.user ko action.payload kr dhenge kynuki user naam ka object hum apne function me se bhej dhenge niche fetchUser me fetchUserSuccess me se 
},
fetchUserFailed(state, action){
    state.loading = false;
    state.isAuthenticated = false;
    state.user = {};
},   


         
//////////////////////////////////////////////////////////////////////////////////////////////////////
      logoutSuccess(state, action){
        state.isAuthenticated = false; // menas agr logout success ho gya to isAuthenticated ki value false krdo 
        state.user = {};
    },
      logoutFailed(state, action){
        state.loading = false;
        state.isAuthenticated = state.isAuthenticated; //yaani phele agr true thi to true hi honi chaiye agr false thi to false hi honi chaye 
        state.user = state.user;
    },
//////////////////////////////////////////////////////////////////////////
fetchLeaderboardRequest(state, action) {
    state.loading = true;
    state.leaderboard = [];
  },
  fetchLeaderboardSuccess(state, action) {
    state.loading = false;
    state.leaderboard = action.payload;
  },
  fetchLeaderboardFailed(state, action) {
    state.loading = false;
    state.leaderboard = [];
  },

////////////////////////////////////////////////////////////////////////////
    clearAllErrors(state, action){
        state.user = state.user;
        state.isAuthenticated = state.isAuthenticated;
        state.leaderboard = state.leaderboard;
        state.loading = false;
    },

    },

});



/////////////////////////////////////////////////////////////////
export const register = (data)=>async(dispatch)=>{ //101 // ye (data)=> Signup.jsx se aarha hai line no. 41 se
    dispatch(userSlice.actions.registerRequest());
    try {
        // const response = await axios.post("http://localhost:5000/api/v1/user/register", data, {
        const response = await axios.post("http://192.168.43.226:5000/api/v1/user/register", data, { // ye wala data uper wale parameter se aarha hai 
            withCredentials: true,
            headers:{
                "Content-Type": "multipart/form-data"
            },
        }  );

        dispatch(userSlice.actions.registerSuccess(response.data));// aur ye response.data ka data backend se aarha hai,  //ye response.data jayega uper line no.25 me state.user = action.payload.user; me 
        toast.success(response.data.message); // aur ye data backend se aarha hai, vahi se araha hai jo hum res.status.json se bhejthe hai ye humne uper routes ko call krke get kiya hai 
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.registerFailed());
        toast.error(error.response.data.message);  //aur ye jo error me se bhejte hai res.status.json se bhejthe hai
        dispatch(userSlice.actions.clearAllErrors());
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////

//function for login
export const login = (data)=>async(dispatch)=>{ //101
    dispatch(userSlice.actions.loginRequest());
    try {
        // const response = await axios.post("http://localhost:5000/api/v1/user/login", data, {
        const response = await axios.post("http://192.168.43.226:5000/api/v1/user/login", data, {
            withCredentials: true,
            headers:{
                "Content-Type": "application/json"
            },
        }  );

        dispatch(userSlice.actions.loginSuccess(response.data));
        toast.success(response.data.message);//ye data  vahi se araha hai jo hum res.status.json se bhejthe hai 
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.loginFailed());
        toast.error(error.response.data.message);
        dispatch(userSlice.actions.clearAllErrors());
    }
};
///////////////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////////////////////////////////
//funtion for logout 
export const logout  = ()=>async(dispatch)=>{
    try {
        // const response = await axios.get("http://localhost:5000/api/v1/user/logout", {withCredentials: true});
        const response = await axios.get("http://192.168.43.226:5000/api/v1/user/logout", {withCredentials: true});
        dispatch(userSlice.actions.logoutSuccess());
        toast.success(response.data.message);//ye data  vahi se araha hai jo hum res.status.json se bhejthe hai 
        dispatch(userSlice.actions.clearAllErrors());

    } catch (error) {
        dispatch(userSlice.actions.logoutFailed());
        toast.error(error.response.data.message);
        dispatch(userSlice.actions.clearAllErrors());
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

////////////ab hum chate hai ki jab humara page refresh ho to user apne aap logout na ho har bar,  yaani ab hum redux ko persist krenge 
///////////////isko App.jsx me bhi set krna pdega useDispatch aur useEffect ki madad se 
export const fetchUser  = ()=>async(dispatch)=>{
    dispatch(userSlice.actions.fetchUserRequest());
    try {            // ye user ko get krne ka url hai 
        // const response = await axios.get("http://localhost:5000/api/v1/user/me", {withCredentials: true});
        const response = await axios.get("http://192.168.43.226:5000/api/v1/user/me", {withCredentials: true});
        dispatch(userSlice.actions.fetchUserSuccess(response.data.user));  // 1000 // ye data.user ka user backend se controller se aarha hai aur fir uper  fetchUserSuccess function/reducers me ja rha
        dispatch(userSlice.actions.clearAllErrors());

    } catch (error) {
        dispatch(userSlice.actions.fetchUserFailed());
        dispatch(userSlice.actions.clearAllErrors());
        console.error(error);
    }
};

//////////////////////////////////////////////////////////////////////////

export const fetchLeaderboard = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchLeaderboardRequest());
    try {
      const response = await axios.get(
        // "http://localhost:5000/api/v1/user/leaderboard",
        "http://192.168.43.226:5000/api/v1/user/leaderboard",
        {
          withCredentials: true,
        }
      );
      dispatch(
        userSlice.actions.fetchLeaderboardSuccess(response.data.leaderboard)
      );
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(userSlice.actions.fetchLeaderboardFailed());
      dispatch(userSlice.actions.clearAllErrors());
      console.error(error);
    }
  };


export default userSlice.reducer;//ab isko store.js me jaker ke isko import krva lo
