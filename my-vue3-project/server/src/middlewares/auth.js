const jwt = require('jsonwebtoken');
const env = require('../config/env');

function auth(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      if (!required) return next();
      const err = new Error('未认证');
      err.status = 401; err.code = 'UNAUTHORIZED';
      return next(err);
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = payload;
      return next();
    } catch (e) {
      const err = new Error('凭证无效或已过期');
      err.status = 401; err.code = 'UNAUTHORIZED';
      return next(err);
    }
  };
}

function role(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('未认证'); err.status = 401; err.code = 'UNAUTHORIZED';
      return next(err);
    }
    if (!roles.includes(req.user.role)) {
      const err = new Error('无权限'); err.status = 403; err.code = 'FORBIDDEN';
      return next(err);
    }
    return next();
  };
}

module.exports = { auth, role };

