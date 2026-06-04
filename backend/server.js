const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.json({ message: 'Loei Coffee API is running' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/owners', require('./routes/owner.routes'));
app.use('/api/farms', require('./routes/farm.routes'));
app.use('/api/coffee-types', require('./routes/coffeeType.routes'));
app.use('/api/farm-types', require('./routes/farmType.routes'));
app.use('/api/soil-types', require('./routes/soilType.routes'));
app.use('/api/productions', require('./routes/production.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/reports', require('./routes/report.routes'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
