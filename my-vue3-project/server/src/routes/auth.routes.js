const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');
const controller = require('../controllers/authController');
const schema = require('../validators/auth.schema');

const router = Router();

router.post('/register', validate(schema.register), controller.register);
router.post('/login', validate(schema.login), controller.login);
router.get('/me', auth(true), controller.me);

module.exports = router;

