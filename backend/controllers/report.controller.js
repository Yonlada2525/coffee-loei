
const pool = require('../config/db');

exports.summary = async (req, res) => {
  const [[farms]] = await pool.query('SELECT COUNT(*) total_farms, COALESCE(SUM(area_size),0) total_area FROM coffee_farm WHERE deleted_at IS NULL');
  const [[owners]] = await pool.query('SELECT COUNT(*) total_owners FROM farm_owner WHERE deleted_at IS NULL');
  const [[prod]] = await pool.query('SELECT COALESCE(SUM(quantity_kg),0) total_production FROM production WHERE deleted_at IS NULL');
  const [byDistrict] = await pool.query('SELECT district, COUNT(*) total FROM coffee_farm WHERE deleted_at IS NULL GROUP BY district ORDER BY total DESC');
  const [byCoffee] = await pool.query('SELECT c.coffee_name, COALESCE(SUM(p.quantity_kg),0) total FROM production p JOIN coffee_type c ON p.coffee_id=c.coffee_id WHERE p.deleted_at IS NULL GROUP BY c.coffee_id ORDER BY total DESC');
  const [byOwner] = await pool.query('SELECT o.fullname, COUNT(f.farm_id) total_farms, COALESCE(SUM(f.area_size),0) total_area FROM farm_owner o LEFT JOIN coffee_farm f ON o.owner_id=f.owner_id AND f.deleted_at IS NULL WHERE o.deleted_at IS NULL GROUP BY o.owner_id ORDER BY total_farms DESC');
  res.json({ ...farms, ...owners, ...prod, byDistrict, byCoffee, byOwner });
};

exports.ownerSummary = async (req, res) => {
  const ownerId = req.user.id;
  const [[farms]] = await pool.query('SELECT COUNT(*) total_farms, COALESCE(SUM(area_size),0) total_area, COUNT(DISTINCT coffee_id) total_coffee_types FROM coffee_farm WHERE owner_id=? AND deleted_at IS NULL', [ownerId]);
  const [[prod]] = await pool.query('SELECT COALESCE(SUM(p.quantity_kg),0) total_production FROM production p JOIN coffee_farm f ON p.farm_id=f.farm_id WHERE f.owner_id=? AND p.deleted_at IS NULL', [ownerId]);
  const [monthly] = await pool.query('SELECT SUM(jan_quantity) jan, SUM(feb_quantity) feb, SUM(mar_quantity) mar FROM production p JOIN coffee_farm f ON p.farm_id=f.farm_id WHERE f.owner_id=? AND p.deleted_at IS NULL', [ownerId]);
  const [byFarm] = await pool.query('SELECT f.farm_name, COALESCE(SUM(p.quantity_kg),0) total FROM coffee_farm f LEFT JOIN production p ON f.farm_id=p.farm_id AND p.deleted_at IS NULL WHERE f.owner_id=? AND f.deleted_at IS NULL GROUP BY f.farm_id ORDER BY total DESC', [ownerId]);
  const [byCoffee] = await pool.query('SELECT c.coffee_name, COALESCE(SUM(p.quantity_kg),0) total FROM production p JOIN coffee_farm f ON p.farm_id=f.farm_id JOIN coffee_type c ON p.coffee_id=c.coffee_id WHERE f.owner_id=? AND p.deleted_at IS NULL GROUP BY c.coffee_id ORDER BY total DESC', [ownerId]);
  res.json({ ...farms, ...prod, monthly: monthly[0] || {}, byFarm, byCoffee });
};
