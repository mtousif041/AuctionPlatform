import app from "./app.js" // jab bhi aap type : module use krte ho to aapko end .js extension jroor likhni hai 
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.listen(process.env.PORT,"0.0.0.0", ()=>{
    console.log(`server is running on port ${process.env.PORT}`);
}); 

// ${import.meta.env.VITE_BASE_URL}