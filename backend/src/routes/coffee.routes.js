const r=require('express').Router();const pool=require('../config/db');const auth=require('../middleware/auth');
r.get('/',async(_,res)=>{const[rows]=await pool.query('SELECT * FROM coffee_type ORDER BY coffee_id DESC');res.json(rows)});
r.post('/',auth(['admin']),async(req,res)=>{const b=req.body;await pool.query('INSERT INTO coffee_type(coffee_name,process_type,description) VALUES (?,?,?)',[b.coffee_name,b.process_type,b.description]);res.json({message:'created'})});
r.put('/:id',auth(['admin']),async(req,res)=>{const b=req.body;await pool.query('UPDATE coffee_type SET coffee_name=?,process_type=?,description=? WHERE coffee_id=?',[b.coffee_name,b.process_type,b.description,req.params.id]);res.json({message:'updated'})});
r.delete('/:id',auth(['admin']),async(req,res)=>{await pool.query('DELETE FROM coffee_type WHERE coffee_id=?',[req.params.id]);res.json({message:'deleted'})});module.exports=r;
