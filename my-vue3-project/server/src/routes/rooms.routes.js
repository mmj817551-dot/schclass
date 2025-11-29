const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { Joi, dateStr } = require('../validators/common');
const controller = require('../controllers/roomsController');

const router = Router();

router.get('/', auth(false), controller.listRooms);
router.get(
  '/:id/reservations',
  auth(false),
  validate(Joi.object({ from: dateStr.required(), to: dateStr.required() }), 'query'),
  controller.listRoomReservations
);

module.exports = router;
