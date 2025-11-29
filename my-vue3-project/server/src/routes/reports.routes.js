const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth, role } = require('../middlewares/auth');
const controller = require('../controllers/reportsController');
const schema = require('../validators/reports.schema');

const router = Router();

router.get('/monthly', auth(true), role('admin'), validate(schema.monthly, 'query'), controller.monthly);

module.exports = router;

