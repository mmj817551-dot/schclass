const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connect } = require('./config/db');

async function boot() {
  try {
    await connect();
  } catch (e) {
    console.error('数据库连接失败:', e.message);
  }
  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

boot();

