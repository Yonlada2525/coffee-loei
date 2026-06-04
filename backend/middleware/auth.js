const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์ใช้งานส่วนนี้' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
  };
}

module.exports = auth;
