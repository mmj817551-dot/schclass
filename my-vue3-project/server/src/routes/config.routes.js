const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const { auth, role } = require('../middlewares/auth');
const controller = require('../controllers/configController');
const Joi = require('joi');

const router = Router();

router.get('/', controller.getConfig);

const patchSchema = Joi.object({
  subjects: Joi.array().items(Joi.string()),
  slotDisplayMap: Joi.object(),
  largeRoomCapacity: Joi.number().integer().min(1),
  weekStart: Joi.string().valid('monday', 'sunday'),
  timezone: Joi.string(),
});

router.patch('/', auth(true), role('admin'), validate(patchSchema), controller.patchConfig);

module.exports = router;
