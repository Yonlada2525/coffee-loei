
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.list = async (req, res) => {
  const deleted = req.query.deleted === '1';
  const [rows] = await pool.query(`SELECT owner_id,username,fullname,phone,email,address,status,created_at,deleted_at, CASE WHEN deleted_at IS NULL THEN NULL ELSE GREATEST(0, 30 - DATEDIFF(CURDATE(), DATE(deleted_at))) END AS restore_days_left FROM farm_owner WHERE deleted_at ${deleted?'IS NOT NULL AND deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)':'IS NULL'} ORDER BY owner_id DESC`);
  res.json(rows);
};
exports.create = async (req, res) => {
  const { username, password, fullname, phone, email, address, status } = req.body;
  const hash = password || 'admin123';
  await pool.query('INSERT INTO farm_owner(username,password,fullname,phone,email,address,status,created_at) VALUES(?,?,?,?,?,?,?,NOW())', [username, hash, fullname, phone, email, address, status || 'approved']);
  res.status(201).json({ message: 'เพิ่มเจ้าของสวนสำเร็จ' });
};
exports.update = async (req, res) => {
  const { fullname, phone, email, address, status, password } = req.body;
  if (password) {
    await pool.query('UPDATE farm_owner SET fullname=?, phone=?, email=?, address=?, status=?, password=? WHERE owner_id=?', [fullname, phone, email, address, status, password, req.params.id]);
  } else {
    await pool.query('UPDATE farm_owner SET fullname=?, phone=?, email=?, address=?, status=? WHERE owner_id=?', [fullname, phone, email, address, status, req.params.id]);
  }
  res.json({ message: 'แก้ไขเจ้าของสวนสำเร็จ' });
};
exports.remove = async (req, res) => {
  await pool.query('UPDATE farm_owner SET deleted_at=NOW() WHERE owner_id=?', [req.params.id]);
  res.json({ message: 'ย้ายเจ้าของสวนไปถังขยะแล้ว' });
};
exports.restore = async (req, res) => {
  await pool.query('UPDATE farm_owner SET deleted_at=NULL WHERE owner_id=?', [req.params.id]);
  res.json({ message: 'กู้คืนเจ้าของสวนสำเร็จ' });
};
