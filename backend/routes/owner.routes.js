const router = require('express').Router();
const c = require('../controllers/owner.controller');
const auth = require('../middleware/auth');
router.get('/', auth(['admin']), c.list);
router.post('/', auth(['admin']), c.create);
router.put('/:id', auth(['admin']), c.update);
router.delete('/:id', auth(['admin']), c.remove);
router.patch('/:id/restore', auth(['admin']), c.restore);
module.exports = router;
