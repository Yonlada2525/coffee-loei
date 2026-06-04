const router = require('express').Router();
const c = require('../controllers/media.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/', c.list);
router.post('/', auth(['admin','owner']), upload.single('file'), c.upload);
router.delete('/:id', auth(['admin','owner']), c.remove);
router.patch('/:id/restore', auth(['admin','owner']), c.restore);
module.exports = router;
