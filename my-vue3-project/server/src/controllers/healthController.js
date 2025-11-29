const { ok } = require('../utils/response');
const { isReady } = require('../config/db');

function live(req, res) { return ok(res, { status: 'live' }); }
function ready(req, res) { return ok(res, { status: isReady() ? 'ready' : 'connecting' }); }

module.exports = { live, ready };

