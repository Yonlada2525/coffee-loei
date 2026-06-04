const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
router.post('/login', c.login);
router.post('/register', c.registerOwner);
router.get('/me', auth(), c.me);
router.put('/me', auth(['admin','owner']), c.updateMe);
module.exports = router;
