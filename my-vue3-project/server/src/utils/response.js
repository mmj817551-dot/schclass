function ok(res, data, meta) {
  return res.json({ success: true, data, ...(meta ? { meta } : {}) });
}

function fail(res, code, message, status = 400, details) {
  return res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}

module.exports = { ok, fail };

