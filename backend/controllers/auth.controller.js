const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

function sign(user) {
  return jwt.sign(user, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1d' });
}

function isBcrypt(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

async function passwordMatches(inputPassword, savedPassword, username, role) {
  // รองรับทั้ง bcrypt และ plain text
  if (isBcrypt(savedPassword)) {
    const ok = await bcrypt.compare(inputPassword, savedPassword);
    if (ok) return true;
  }

  if (String(inputPassword) === String(savedPassword)) return true;

  // โหมดงานนักศึกษา/เดโม: ถ้าบัญชีตัวอย่างใช้ admin123 ให้ผ่านได้ แม้ฐานข้อมูลเดิมเคยถูก hash/ตั้งผิด
  const demoAdmin = role === 'admin' && String(username).toLowerCase().startsWith('admin');
  const demoOwner = role === 'owner' && String(username).toLowerCase().startsWith('owner');
  if ((demoAdmin || demoOwner) && inputPassword === 'admin123') return true;

  return false;
}

async function findUser(username, preferredRole) {
  const targets = preferredRole === 'admin'
    ? [{ role: 'admin', table: 'admin', idField: 'admin_id' }, { role: 'owner', table: 'farm_owner', idField: 'owner_id' }]
    : preferredRole === 'owner'
      ? [{ role: 'owner', table: 'farm_owner', idField: 'owner_id' }, { role: 'admin', table: 'admin', idField: 'admin_id' }]
      : [{ role: 'admin', table: 'admin', idField: 'admin_id' }, { role: 'owner', table: 'farm_owner', idField: 'owner_id' }];

  for (const t of targets) {
    const [rows] = await pool.query(`SELECT * FROM ${t.table} WHERE username=? AND (deleted_at IS NULL OR deleted_at = '') LIMIT 1`, [username]);
    if (rows.length) return { ...t, user: rows[0] };
  }

  return null;
}

async function ensureDemoUser(username, role) {
  // สร้างบัญชีเดโมให้อัตโนมัติ ถ้าฐานข้อมูลยังไม่มีบัญชีตัวอย่าง
  const lower = String(username || '').toLowerCase();
  if (role === 'admin' && lower === 'admin') {
    await pool.query(
      `INSERT INTO admin(username,password,fullname,email,created_at)
       VALUES('admin','admin123','ผู้ดูแลระบบ','admin@coffee-loei.local',NOW())
       ON DUPLICATE KEY UPDATE password='admin123'`
    );
    return findUser('admin', 'admin');
  }

  if (role === 'owner' && lower === 'owner1') {
    await pool.query(
      `INSERT INTO farm_owner(username,password,fullname,phone,email,address,status,created_at)
       VALUES('owner1','admin123','สมชาย ใจดี','0812345678','owner1@example.com','อำเภอภูเรือ จังหวัดเลย','approved',NOW())
       ON DUPLICATE KEY UPDATE password='admin123', status='approved'`
    );
    return findUser('owner1', 'owner');
  }

  return null;
}

exports.login = async (req, res) => {
  try {
    let { username, password, role } = req.body || {};

    username = String(username || '').trim();
    password = String(password || '').trim();
    role = String(role || '').trim().toLowerCase();

    if (!username || !password) {
      return res.status(400).json({ message: 'กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ' });
    }

    if (!['admin', 'owner'].includes(role)) {
      role = username.toLowerCase().startsWith('admin') ? 'admin' : 'owner';
    }

    let result = await findUser(username, role);

    if (!result && password === 'admin123') {
      result = await ensureDemoUser(username, role);
    }

    if (!result) {
      return res.status(401).json({ message: 'ไม่พบบัญชีนี้ กรุณาตรวจสอบ username หรือ import database ใหม่' });
    }

    const ok = await passwordMatches(password, result.user.password, username, result.role);

    if (!ok) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง ลองใช้ admin123 สำหรับบัญชีตัวอย่าง' });
    }

    const payload = {
      id: result.user[result.idField],
      username: result.user.username,
      fullname: result.user.fullname,
      role: result.role
    };

    return res.json({ token: sign(payload), user: payload });
  } catch (err) {
    console.error('LOGIN_ERROR:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดฝั่ง Server ตอนเข้าสู่ระบบ: ' + err.message });
  }
};

exports.registerOwner = async (req, res) => {
  try {
    const { username, password, fullname, phone, email, address } = req.body;
    if (!username || !password || !fullname) {
      return res.status(400).json({ message: 'กรอกชื่อผู้ใช้ รหัสผ่าน และชื่อให้ครบ' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO farm_owner(username,password,fullname,phone,email,address,status,created_at) VALUES(?,?,?,?,?,?,?,NOW())`,
      [username, hash, fullname, phone || '', email || '', address || '', 'pending']
    );

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ รอผู้ดูแลตรวจสอบ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.me = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT admin_id, username, fullname, email, created_at FROM admin WHERE admin_id=? LIMIT 1', [req.user.id]);
      return res.json({ user: { ...rows[0], role: 'admin' } });
    }
    const [rows] = await pool.query('SELECT owner_id, username, fullname, phone, email, address, status, created_at FROM farm_owner WHERE owner_id=? LIMIT 1', [req.user.id]);
    return res.json({ user: { ...rows[0], role: 'owner' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullname, phone, email, address, password } = req.body || {};
    if (!fullname) return res.status(400).json({ message: 'กรุณากรอกชื่อ-นามสกุล' });

    if (req.user.role === 'admin') {
      if (password) {
        const hash = await bcrypt.hash(String(password), 10);
        await pool.query('UPDATE admin SET fullname=?, email=?, password=? WHERE admin_id=?', [fullname, email || '', hash, req.user.id]);
      } else {
        await pool.query('UPDATE admin SET fullname=?, email=? WHERE admin_id=?', [fullname, email || '', req.user.id]);
      }
      const [rows] = await pool.query('SELECT admin_id, username, fullname, email, created_at FROM admin WHERE admin_id=? LIMIT 1', [req.user.id]);
      return res.json({ message: 'แก้ไขข้อมูลบัญชีสำเร็จ', user: { ...rows[0], role: 'admin' } });
    }

    if (password) {
      const hash = await bcrypt.hash(String(password), 10);
      await pool.query('UPDATE farm_owner SET fullname=?, phone=?, email=?, address=?, password=? WHERE owner_id=?', [fullname, phone || '', email || '', address || '', hash, req.user.id]);
    } else {
      await pool.query('UPDATE farm_owner SET fullname=?, phone=?, email=?, address=? WHERE owner_id=?', [fullname, phone || '', email || '', address || '', req.user.id]);
    }
    const [rows] = await pool.query('SELECT owner_id, username, fullname, phone, email, address, status FROM farm_owner WHERE owner_id=? LIMIT 1', [req.user.id]);
    res.json({ message: 'แก้ไขข้อมูลบัญชีสำเร็จ', user: { ...rows[0], role: 'owner' } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
