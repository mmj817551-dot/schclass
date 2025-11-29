const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');
const controller = require('../controllers/usersController');
const authController = require('../controllers/authController');
const schema = require('../validators/users.schema');

const router = Router();

router.get('/students/search', auth(true), validate(schema.searchStudents, 'query'), controller.searchStudents);
router.get('/teachers/:id/students', auth(true), controller.getTeacherStudents);
router.get('/me', auth(true), authController.me);

module.exports = router;
