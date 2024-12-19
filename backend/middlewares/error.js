class ErrorHandler extends Error {
    // yaani humne ek claas bnai errorHandler ki jo extends krta hai Error ki class ko aur ye Error class node js me already hoti hai 
    constructor(message, statusCode){ // hmare pass jo uper error class hota hai usme sirf message hota hai usme statusCode naam ki koi field nhai hoti
        super(message); // yaani jo message hai usko to super class me se get krna hai 
        this.statusCode = statusCode; // yaani this.statusCode braabr hai statusCode yaani ye statusCode is class ka apna hai  vo error ki class ka nhai hai 

    }
}

export const errorMiddleware = (err, req, res, next)=>{ // ye req, res, next theno user controller me jo paramete r diye vo hi hai 
  err.message = err.message || "Internal server error .";
  err.statusCode = err.statusCode || 500;
  
  
  // console.log(err);
  if(err.name === "JsonWebTokenError"){
    const message = "Json Web Token is invalid , try again"
    err = new ErrorHandler(message, 400)  // i think yha pr humne class ka object bnaya hai  aur class ko call kiya hai 
  }
  if(err.name === "TokenExpiredError"){
    const message = "Json Web Token is expired , try again"
    err = new ErrorHandler(message, 400)
  }  
  if(err.name === "CastError"){ // iska ye matlab ki manlo ki mene phone me number formate ki bjeye string bhej diya to vo error dega 
    const message = `invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors ? Obeject.values(err.errors).map(error=> error.message).join(" "): err.message;
  // yaani jo err hai usme agr errors exist krte ho uske ander jo bject hai unki jo values hai err.error unpe apko map method run krna hai aur fir uske ander se un saare messages ko get krna hai aur fir un saare messages ko apko aapas me join to krna hai aur bicheme ek space dena hai 

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};


// error handler ko bhi export  kr dete hai uper errorMiddleware ko to export already kr diya hai 
export default ErrorHandler; // ab inko   controller me use krna hai aur errorMiddleware ko  app.js me