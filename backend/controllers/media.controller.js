const pool = require('../config/db');

exports.list = async (req, res) => {
  const deleted = req.query.deleted === '1';
  const [rows] = await pool.query(
    `SELECT m.*, CASE WHEN m.deleted_at IS NULL THEN NULL ELSE GREATEST(0, 30 - DATEDIFF(CURDATE(), DATE(m.deleted_at))) END AS restore_days_left, f.farm_name
     FROM media m
     LEFT JOIN coffee_farm f ON m.farm_id = f.farm_id
     WHERE m.deleted_at ${deleted ? 'IS NOT NULL AND m.deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'IS NULL'}
     ORDER BY m.media_id DESC`
  );
  res.json(rows);
};

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาเลือกไฟล์' });
  if (!req.body.farm_id) return res.status(400).json({ message: 'กรุณาเลือกสวนกาแฟ' });

  if (req.user?.role === 'owner') {
    const [own] = await pool.query('SELECT farm_id FROM coffee_farm WHERE farm_id=? AND owner_id=? AND deleted_at IS NULL LIMIT 1', [req.body.farm_id, req.user.id]);
    if (!own.length) return res.status(403).json({ message: 'อัปโหลดรูปได้เฉพาะสวนของตนเอง' });
  }

  await pool.query('INSERT INTO media(farm_id,file_path,upload_date) VALUES(?,?,NOW())', [
    req.body.farm_id,
    `uploads/${req.file.filename}`
  ]);

  res.status(201).json({ message: 'อัปโหลดสำเร็จ' });
};

exports.remove = async (req, res) => {
  await pool.query('UPDATE media SET deleted_at=NOW() WHERE media_id=?', [req.params.id]);
  res.json({ message: 'ย้ายสื่อไปถังขยะแล้ว' });
};

exports.restore = async (req, res) => {
  await pool.query('UPDATE media SET deleted_at=NULL WHERE media_id=?', [req.params.id]);
  res.json({ message: 'กู้คืนสื่อสำเร็จ' });
};
