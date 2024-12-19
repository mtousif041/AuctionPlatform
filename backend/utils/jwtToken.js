// ye file ek token ko generate krega 
export const generateToken = (user, message, statusCode, res)=>{ // ye jo user aaya hai controller se iske ander generateJsonWebToken hai 
    const token = user.generateJsonWebToken(); // yha pr to mene isko export hi nhai kiya lekin fir bhi ye kaam kr prha hai kese dhekenge,// ye jo user humne bheja hai ab iske ander userSchema ki saari cheeje aa chuki hai uske methods bhi jo humne userSchema me create kiye the , const user = await User.create({ iski vajaha se , ab yha se aap user.generateJsonWebToken() krke generateJsonWebToken method ko call ya use kr shakte ho 
    res.status(statusCode).cookie("token", token, { //isse hmara token cookies me token ke name se save ho jaayega 
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // yaani jab hmara user register kr vaayega usme add krdo process.env.COOKIE_EXPIRE , config.env me COOKIE_EXPIRE=7 yaani isme aage d(day nhai likhna)
        httpOnly: true // agr  httpOnly: true nhai kroge to ye kaam nhai krega
    }).json({
        success: true,
        message,
        user,
        token
    });
};