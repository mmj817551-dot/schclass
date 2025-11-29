const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const env = require('./config/env');
const client = require('prom-client');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errors');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use((req, res, next) => { req.id = uuidv4(); next(); });
app.use((req, res, next) => { if (req.id) res.set('X-Request-Id', req.id); next(); });
app.use(morgan(':method :url :status - :response-time ms'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api', routes);

// Metrics endpoint (Prometheus)
client.collectDefaultMetrics({ prefix: 'scheduler_' });
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
  } catch (e) {
    res.status(500).send('# metrics unavailable');
  }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
