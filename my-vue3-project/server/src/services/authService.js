const User = require('../models/User');
const { hashPassword, comparePassword, signToken } = require('../utils/crypto');

async function register({ role, name, phone, password, subject }) {
  const exists = await User.findOne({ phone });
  if (exists) {
    const err = new Error('手机号已存在');
    err.status = 409; err.code = 'DUPLICATE_USER';
    throw err;
  }
  const passwordHash = await hashPassword(password);
  const doc = await User.create({ role, name, phone, passwordHash, subject });
  const token = signToken(doc);
  return { user: toSafeUser(doc), token };
}

async function login({ phone, password }) {
  const user = await User.findOne({ phone });
  if (!user) { const e = new Error('账号或密码错误'); e.status = 401; e.code = 'UNAUTHORIZED'; throw e; }
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) { const e = new Error('账号或密码错误'); e.status = 401; e.code = 'UNAUTHORIZED'; throw e; }
  const token = signToken(user);
  return { user: toSafeUser(user), token };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) { const e = new Error('用户不存在'); e.status = 404; e.code = 'NOT_FOUND'; throw e; }
  return { user: toSafeUser(user) };
}

function toSafeUser(u) {
  return { _id: u._id, name: u.name, phone: u.phone, role: u.role, subject: u.subject };
}

module.exports = { register, login, me };

