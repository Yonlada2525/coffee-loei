const router = require('express').Router();
const c = require('../controllers/farm.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', c.list);
router.get('/mine', auth(['owner']), c.myFarms);
router.get('/:id', c.detail);
// router.post('/', auth(['admin','owner']), c.create);
router.post(
  '/',
  auth(['admin','owner']),
  upload.single('image'),
  c.create
);


router.put('/:id', auth(['admin','owner']), c.update);
router.delete('/:id', auth(['admin','owner']), c.remove);
router.patch('/:id/restore', auth(['admin','owner']), c.restore);
module.exports = router;
