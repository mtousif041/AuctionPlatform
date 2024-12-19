 // ye is file me aur endedAuctionCron.js me aur .env me use ki gai hai,  baaki file me nahi  
import nodeMailer from "nodemailer";  //6:08:00 

export const sendEmail = async({email, subject, message})=>{
const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const options = {
    from: process.env.SMTP_MAIL,
    to: email, // yaani jo email aayegi us user ko mail bhej deni hai 
    subject: subject,
    text: message
}

await transporter.sendMail(options);

}