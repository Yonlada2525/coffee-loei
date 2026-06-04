
const pool = require('../config/db');

function hasDeleted(table){ return ['farm_type','coffee_type','soil_type'].includes(table); }

exports.list = (table, order = '1 DESC') => async (req, res) => {
  const deleted = req.query.deleted === '1';
  const where = hasDeleted(table) ? (deleted ? 'WHERE deleted_at IS NOT NULL AND deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'WHERE deleted_at IS NULL') : '';
  const select = hasDeleted(table) ? `*, CASE WHEN deleted_at IS NULL THEN NULL ELSE GREATEST(0, 30 - DATEDIFF(CURDATE(), DATE(deleted_at))) END AS restore_days_left` : '*';
  const [rows] = await pool.query(`SELECT ${select} FROM ${table} ${where} ORDER BY ${order}`);
  res.json(rows);
};

exports.remove = (table, idField) => async (req, res) => {
  if (hasDeleted(table)) {
    await pool.query(`UPDATE ${table} SET deleted_at=NOW() WHERE ${idField}=?`, [req.params.id]);
  } else {
    await pool.query(`DELETE FROM ${table} WHERE ${idField}=?`, [req.params.id]);
  }
  res.json({ message: 'ย้ายไปถังขยะแล้ว' });
};

exports.restore = (table, idField) => async (req, res) => {
  await pool.query(`UPDATE ${table} SET deleted_at=NULL WHERE ${idField}=?`, [req.params.id]);
  res.json({ message: 'กู้คืนข้อมูลสำเร็จ' });
};
