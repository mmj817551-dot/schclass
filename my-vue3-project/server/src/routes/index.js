const { Router } = require('express');
const health = require('./health.routes');
const configRoutes = require('./config.routes');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const bindingsRoutes = require('./bindings.routes');
const roomsRoutes = require('./rooms.routes');
const reservationsRoutes = require('./reservations.routes');
const reportsRoutes = require('./reports.routes');

const router = Router();

router.use('/health', health);
router.use('/config', configRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/bindings', bindingsRoutes);
router.use('/rooms', roomsRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
