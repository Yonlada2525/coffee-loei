const r=require('express').Router();const pool=require('../config/db');const auth=require('../middleware/auth');
const sql='SELECT p.*,f.farm_name,c.coffee_name FROM production p LEFT JOIN coffee_farm f ON f.farm_id=p.farm_id LEFT JOIN coffee_type c ON c.coffee_id=p.coffee_id';
r.get('/',auth(['admin']),async(_,res)=>{const[rows]=await pool.query(sql+' ORDER BY p.production_id DESC');res.json(rows)});
r.get('/mine',auth(['owner']),async(req,res)=>{const[rows]=await pool.query(sql+' WHERE f.owner_id=? ORDER BY p.production_id DESC',[req.user.id]);res.json(rows)});
r.post('/',auth(['admin','owner']),async(req,res)=>{const b=req.body;const total=Number(b.jan_quantity||0)+Number(b.feb_quantity||0)+Number(b.mar_quantity||0);await pool.query('INSERT INTO production(coffee_id,farm_id,harvest_year,jan_quantity,feb_quantity,mar_quantity,quantity_kg) VALUES (?,?,?,?,?,?,?)',[b.coffee_id,b.farm_id,b.harvest_year,b.jan_quantity||0,b.feb_quantity||0,b.mar_quantity||0,total]);res.json({message:'created'})});
r.delete('/:id',auth(['admin','owner']),async(req,res)=>{await pool.query('DELETE FROM production WHERE production_id=?',[req.params.id]);res.json({message:'deleted'})});module.exports=r;
