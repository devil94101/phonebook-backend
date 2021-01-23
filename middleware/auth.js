const jwt=require('jsonwebtoken')
module.exports=function(req,res,next){
    const token=req.header('x-auth-token')
    if(!token){
        return res.json({
            err:true,
            msg:"Token error"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next();
    }
    catch(err){
        res.json({
            err:true,
            msg:err.message
        })
    }
}