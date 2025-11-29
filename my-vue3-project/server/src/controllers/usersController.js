const { ok } = require('../utils/response');
const service = require('../services/userService');

async function searchStudents(req, res, next) {
  try {
    const { name, phone, page = 1, pageSize = 20 } = req.query;
    const { items, meta } = await service.searchStudents({ name, phone, page: Number(page), pageSize: Number(pageSize) });
    return ok(res, items, meta);
  } catch (e) { return next(e); }
}

async function getTeacherStudents(req, res, next) {
  try { const list = await service.getTeacherStudents(req.params.id); return ok(res, list); } catch (e) { return next(e); }
}

module.exports = { searchStudents, getTeacherStudents };

