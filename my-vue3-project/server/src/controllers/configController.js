const { ok } = require('../utils/response');
const service = require('../services/configService');

async function getConfig(req, res, next) {
  try { const data = await service.getConfig(); return ok(res, data); } catch (e) { return next(e); }
}

async function patchConfig(req, res, next) {
  try { const data = await service.updateConfig(req.body); return ok(res, data); } catch (e) { return next(e); }
}

module.exports = { getConfig, patchConfig };

