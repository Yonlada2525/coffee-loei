
const pool = require('../config/db');

const base = `SELECT p.*, CASE WHEN p.deleted_at IS NULL THEN NULL ELSE GREATEST(0, 30 - DATEDIFF(CURDATE(), DATE(p.deleted_at))) END AS restore_days_left, f.farm_name, f.owner_id, c.coffee_name
FROM production p
LEFT JOIN coffee_farm f ON p.farm_id=f.farm_id
LEFT JOIN coffee_type c ON p.coffee_id=c.coffee_id`;

async function ownerCanUseFarm(ownerId, farmId) {
  const [rows] = await pool.query('SELECT farm_id FROM coffee_farm WHERE farm_id=? AND owner_id=? AND deleted_at IS NULL LIMIT 1', [farmId, ownerId]);
  return rows.length > 0;
}

exports.list = async (req, res) => {
  const del = req.query.deleted === '1';
  const [rows] = await pool.query(`${base} WHERE p.deleted_at ${del ? 'IS NOT NULL AND p.deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'IS NULL'} ORDER BY p.production_id DESC`);
  res.json(rows);
};

exports.myList = async (req, res) => {
  const del = req.query.deleted === '1';
  const [rows] = await pool.query(`${base} WHERE f.owner_id=? AND p.deleted_at ${del ? 'IS NOT NULL AND p.deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'IS NULL'} ORDER BY p.production_id DESC`, [req.user.id]);
  res.json(rows);
};

exports.create = async (req, res) => {
  const b = req.body;
  if (req.user.role === 'owner' && !(await ownerCanUseFarm(req.user.id, b.farm_id))) {
    return res.status(403).json({ message: 'จัดการผลผลิตได้เฉพาะสวนของตนเอง' });
  }
  const total = Number(b.jan_quantity || 0) + Number(b.feb_quantity || 0) + Number(b.mar_quantity || 0);
  await pool.query(
    'INSERT INTO production(coffee_id,farm_id,harvest_year,jan_quantity,feb_quantity,mar_quantity,quantity_kg) VALUES(?,?,?,?,?,?,?)',
    [b.coffee_id, b.farm_id, b.harvest_year, b.jan_quantity || 0, b.feb_quantity || 0, b.mar_quantity || 0, b.quantity_kg || total]
  );
  res.status(201).json({ message: 'เพิ่มผลผลิตสำเร็จ' });
};

exports.update = async (req, res) => {
  const b = req.body;
  if (req.user.role === 'owner' && !(await ownerCanUseFarm(req.user.id, b.farm_id))) {
    return res.status(403).json({ message: 'จัดการผลผลิตได้เฉพาะสวนของตนเอง' });
  }
  let where = 'production_id=?';
  const params = [b.coffee_id, b.farm_id, b.harvest_year, b.jan_quantity || 0, b.feb_quantity || 0, b.mar_quantity || 0, b.quantity_kg || (Number(b.jan_quantity || 0) + Number(b.feb_quantity || 0) + Number(b.mar_quantity || 0)), req.params.id];
  if (req.user.role === 'owner') {
    where += ' AND farm_id IN (SELECT farm_id FROM coffee_farm WHERE owner_id=?)';
    params.push(req.user.id);
  }
  await pool.query(`UPDATE production SET coffee_id=?,farm_id=?,harvest_year=?,jan_quantity=?,feb_quantity=?,mar_quantity=?,quantity_kg=? WHERE ${where}`, params);
  res.json({ message: 'แก้ไขผลผลิตสำเร็จ' });
};

exports.remove = async (req, res) => {
  let sql = 'UPDATE production SET deleted_at=NOW() WHERE production_id=?';
  const params = [req.params.id];
  if (req.user.role === 'owner') {
    sql += ' AND farm_id IN (SELECT farm_id FROM coffee_farm WHERE owner_id=?)';
    params.push(req.user.id);
  }
  await pool.query(sql, params);
  res.json({ message: 'ย้ายผลผลิตไปถังขยะแล้ว' });
};

exports.restore = async (req, res) => {
  let sql = 'UPDATE production SET deleted_at=NULL WHERE production_id=?';
  const params = [req.params.id];
  if (req.user.role === 'owner') {
    sql += ' AND farm_id IN (SELECT farm_id FROM coffee_farm WHERE owner_id=?)';
    params.push(req.user.id);
  }
  await pool.query(sql, params);
  res.json({ message: 'กู้คืนผลผลิตสำเร็จ' });
};
