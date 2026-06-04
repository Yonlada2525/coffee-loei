const express=require('express');const cors=require('cors');const path=require('path');require('dotenv').config();
const app=express();app.use(cors({origin:true,credentials:true}));app.use(express.json());app.use('/uploads',express.static(path.join(__dirname,'../../uploads')));
app.use('/api/auth',require('./routes/auth.routes'));app.use('/api/lookups',require('./routes/lookup.routes'));app.use('/api/farms',require('./routes/farm.routes'));app.use('/api/owners',require('./routes/owner.routes'));app.use('/api/coffee-types',require('./routes/coffee.routes'));app.use('/api/productions',require('./routes/production.routes'));app.use('/api/media',require('./routes/media.routes'));app.use('/api/reports',require('./routes/report.routes'));
app.get('/',(_,res)=>res.json({message:'Coffee Loei DB API'}));
const port=process.env.PORT||5000;app.listen(port,()=>console.log('API running http://localhost:'+port));
