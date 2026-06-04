const r=require('express').Router();const multer=require('multer');const path=require('path');const fs=require('fs');const pool=require('../config/db');const auth=require('../middleware/auth');
const dir=path.join(__dirname,'../../uploads');if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
const storage=multer.diskStorage({destination:(_,__,cb)=>cb(null,dir),filename:(_,file,cb)=>cb(null,Date.now()+'-'+file.originalname.replace(/\s+/g,'-'))});const up=multer({storage});
r.get('/',auth(['admin','owner']),async(req,res)=>{const[rows]=await pool.query('SELECT m.*,f.farm_name FROM media m LEFT JOIN coffee_farm f ON f.farm_id=m.farm_id ORDER BY m.media_id DESC');res.json(rows)});
r.post('/',auth(['admin','owner']),up.single('file'),async(req,res)=>{const filePath=req.file?`backend/uploads/${req.file.filename}`:req.body.file_path;await pool.query('INSERT INTO media(farm_id,file_path) VALUES (?,?)',[req.body.farm_id,filePath]);res.json({message:'uploaded',file_path:filePath})});
r.delete('/:id',auth(['admin','owner']),async(req,res)=>{await pool.query('DELETE FROM media WHERE media_id=?',[req.params.id]);res.json({message:'deleted'})});module.exports=r;
