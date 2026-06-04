const router = require('express').Router();
const c = require('../controllers/report.controller');
const auth = require('../middleware/auth');
router.get('/summary', auth(['admin']), c.summary);
router.get('/owner-summary', auth(['owner']), c.ownerSummary);
module.exports = router;
