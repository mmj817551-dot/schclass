const { ok } = require('../utils/response');
const rooms = require('../services/roomsService');
const reservations = require('../services/reservationService');

async function listRooms(req, res, next) {
  try { const data = await rooms.listRooms(); return ok(res, data); } catch (e) { return next(e); }
}

async function listRoomReservations(req, res, next) {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const data = await reservations.listRoomReservations(id, from, to);
    return ok(res, data);
  } catch (e) { return next(e); }
}

module.exports = { listRooms, listRoomReservations };

