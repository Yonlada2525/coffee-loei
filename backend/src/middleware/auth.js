const jwt=require('jsonwebtoken');
function auth(roles=[]){return(req,res,next)=>{try{const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(!token)return res.status(401).json({message:'กรุณาเข้าสู่ระบบ'});const user=jwt.verify(token,process.env.JWT_SECRET||'coffee_loei_secret_2026');if(roles.length&&!roles.includes(user.role))return res.status(403).json({message:'ไม่มีสิทธิ์ใช้งาน'});req.user=user;next();}catch(e){res.status(401).json({message:'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่'});}}}
module.exports=auth;
