const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function hashPassword(plain) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    name: user.name,
    phone: user.phone,
    subject: user.subject || undefined,
  };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });
  return token;
}

module.exports = { hashPassword, comparePassword, signToken };

