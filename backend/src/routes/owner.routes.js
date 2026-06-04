const r=require('express').Router();const pool=require('../config/db');const auth=require('../middleware/auth');
r.get('/',auth(['admin']),async(_,res)=>{const[rows]=await pool.query('SELECT * FROM farm_owner ORDER BY owner_id DESC');res.json(rows)});
r.post('/',auth(['admin']),async(req,res)=>{const b=req.body;await pool.query('INSERT INTO farm_owner(username,password,fullname,phone,email,address,status) VALUES (?,?,?,?,?,?,?)',[b.username,b.password||'admin123',b.fullname,b.phone,b.email,b.address,b.status||'approved']);res.json({message:'created'})});
r.put('/:id',auth(['admin']),async(req,res)=>{const b=req.body;await pool.query('UPDATE farm_owner SET fullname=?,phone=?,email=?,address=?,status=? WHERE owner_id=?',[b.fullname,b.phone,b.email,b.address,b.status,req.params.id]);res.json({message:'updated'})});
r.delete('/:id',auth(['admin']),async(req,res)=>{await pool.query('DELETE FROM farm_owner WHERE owner_id=?',[req.params.id]);res.json({message:'deleted'})});module.exports=r;
