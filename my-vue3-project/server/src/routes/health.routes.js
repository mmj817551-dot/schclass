const { Router } = require('express');
const { ok } = require('../utils/response');
const { isReady } = require('../config/db');

const router = Router();

router.get('/live', (req, res) => ok(res, { status: 'live' }));
router.get('/ready', (req, res) => ok(res, { status: isReady() ? 'ready' : 'connecting' }));

module.exports = router;

