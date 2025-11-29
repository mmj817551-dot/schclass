const { ok } = require('../utils/response');
const svc = require('../services/reservationService');

async function create(req, res, next) {
  try {
    const out = await svc.createReservation(req.user.sub, req.body);
    return ok(res, out);
  } catch (e) { return next(e); }
}

async function getOne(req, res, next) {
  try { const data = await svc.getReservation(req.params.id); return ok(res, data); } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try { const data = await svc.deleteReservation(req.params.id, req.user); return ok(res, data); } catch (e) { return next(e); }
}

async function listRange(req, res, next) {
  try { const data = await svc.listReservations(req.query); return ok(res, data); } catch (e) { return next(e); }
}

async function listRoomRange(req, res, next) {
  try { const data = await svc.listRoomReservations(req.params.id, req.query.from, req.query.to); return ok(res, data); } catch (e) { return next(e); }
}

async function listMy(req, res, next) {
  try { const data = await svc.listMy(req.query, req.user); return ok(res, data); } catch (e) { return next(e); }
}

async function listHistory(req, res, next) {
  try { const data = await svc.listHistory(req.query, req.user); return ok(res, data); } catch (e) { return next(e); }
}

module.exports = { create, getOne, remove, listRange, listRoomRange, listMy, listHistory };
