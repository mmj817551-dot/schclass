const { fail } = require('../utils/response');

function notFound(req, res, next) {
  return fail(res, 'NOT_FOUND', '未找到资源', 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const code = err.code || (status >= 500 ? 'API_ERROR' : 'BAD_REQUEST');
  const message = err.message || '服务器错误';
  return fail(res, code, message, status, err.details);
}

module.exports = { notFound, errorHandler };

