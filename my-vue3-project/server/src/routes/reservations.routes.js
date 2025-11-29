const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth, role } = require('../middlewares/auth');
const controller = require('../controllers/reservationsController');
const schema = require('../validators/reservations.schema');
const { Joi, dateStr, objectId } = require('../validators/common');

const router = Router();

router.post('/', auth(true), role('teacher'), validate(schema.create), controller.create);

router.get('/', auth(false), validate(schema.listRange, 'query'), controller.listRange);

router.get('/my', auth(true), validate(Joi.object({ from: dateStr.required(), to: dateStr.required(), role: Joi.string().valid('teacher', 'student').required() }), 'query'), controller.listMy);

router.get('/history', auth(true), validate(Joi.object({ from: dateStr.required(), to: dateStr.required(), role: Joi.string().valid('student','teacher').required() }), 'query'), controller.listHistory);

// Detail routes must come after specific paths like /my and /history
router.get('/:id([0-9a-fA-F]{24})', auth(true), controller.getOne);
router.delete('/:id([0-9a-fA-F]{24})', auth(true), controller.remove);

module.exports = router;
