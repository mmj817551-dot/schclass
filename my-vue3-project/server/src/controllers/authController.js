const { ok } = require('../utils/response');
const service = require('../services/authService');

async function register(req, res, next) {
  try { const data = await service.register(req.body); return ok(res, data); } catch (e) { return next(e); }
}

async function login(req, res, next) {
  try { const data = await service.login(req.body); return ok(res, data); } catch (e) { return next(e); }
}

async function me(req, res, next) {
  try { const data = await service.me(req.user.sub); return ok(res, data); } catch (e) { return next(e); }
}

module.exports = { register, login, me };

