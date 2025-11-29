const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth, role } = require('../middlewares/auth');
const controller = require('../controllers/bindingsController');
const schema = require('../validators/bindings.schema');

const router = Router();

// 教师发起绑定
router.post('/', auth(true), role('teacher'), validate(schema.create), controller.createBinding);

// 学生待审批绑定
router.get('/pending', auth(true), role('student'), controller.listPendingForStudent);

// 学生同意/拒绝绑定
router.patch('/:id', auth(true), role('student'), validate(schema.process), controller.processBinding);

// 我的绑定（教师/学生通用）
router.get('/mine', auth(true), controller.listMyBindings);

// 学生发起解绑
router.post('/:id/unbind', auth(true), role('student'), controller.requestUnbind);

// 教师审批解绑列表
router.get('/pending-unbind', auth(true), role('teacher'), controller.listPendingUnbindForTeacher);

// 教师审批解绑
router.patch('/:id/unbind', auth(true), role('teacher'), validate(schema.processUnbind), controller.processUnbind);

module.exports = router;

