const mongoose = require('mongoose');
const env = require('./env');

let connected = false;

async function connect() {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: true,
  });
  connected = true;
  return mongoose.connection;
}

function isReady() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connect, isReady };

