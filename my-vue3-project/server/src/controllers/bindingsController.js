const { ok } = require('../utils/response');
const service = require('../services/bindingService');

async function createBinding(req, res, next) {
  try { const data = await service.createBinding(req.user.sub, req.body.studentId); return ok(res, { bindingId: data._id, status: data.status }); } catch (e) { return next(e); }
}

async function listPendingForStudent(req, res, next) {
  try { const data = await service.listPendingForStudent(req.user.sub); return ok(res, data); } catch (e) { return next(e); }
}

async function processBinding(req, res, next) {
  try { const out = await service.processBinding(req.user.sub, req.params.id, req.body.action); return ok(res, out); } catch (e) { return next(e); }
}

async function listMyBindings(req, res, next) {
  try { const data = await service.listMyBindings(req.user); return ok(res, data); } catch (e) { return next(e); }
}

async function requestUnbind(req, res, next) {
  try { const out = await service.requestUnbind(req.user.sub, req.params.id); return ok(res, out); } catch (e) { return next(e); }
}

async function listPendingUnbindForTeacher(req, res, next) {
  try { const data = await service.listPendingUnbindForTeacher(req.user.sub); return ok(res, data); } catch (e) { return next(e); }
}

async function processUnbind(req, res, next) {
  try { const out = await service.processUnbind(req.user.sub, req.params.id, req.body.action); return ok(res, out); } catch (e) { return next(e); }
}

module.exports = {
  createBinding,
  listPendingForStudent,
  processBinding,
  listMyBindings,
  requestUnbind,
  listPendingUnbindForTeacher,
  processUnbind,
};

