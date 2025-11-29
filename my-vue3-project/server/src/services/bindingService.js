const Binding = require('../models/Binding');
const User = require('../models/User');

function ensure(condition, message, code = 'BAD_REQUEST', status = 400) {
  if (!condition) { const e = new Error(message); e.code = code; e.status = status; throw e; }
}

async function createBinding(teacherId, studentId) {
  const student = await User.findById(studentId);
  ensure(student && student.role === 'student', '学生无效', 'VALIDATION_ERROR', 422);
  const dup = await Binding.findOne({ teacherId, studentId, status: { $in: ['pending', 'approved', 'pending-unbind'] } });
  ensure(!dup, '重复绑定', 'DUPLICATE_BINDING', 409);
  const doc = await Binding.create({ teacherId, studentId, status: 'pending', actorLog: [{ actorId: teacherId, action: 'create' }] });
  return doc.toObject();
}

async function listPendingForStudent(studentId) {
  const list = await Binding.find({ studentId, status: 'pending' }).populate('teacherId', 'name subject');
  return list.map(b => ({ _id: b._id, teacher: { _id: b.teacherId._id, name: b.teacherId.name, subject: b.teacherId.subject }, createdAt: b.createdAt }));
}

async function processBinding(studentId, bindingId, action) {
  const b = await Binding.findById(bindingId);
  ensure(b && String(b.studentId) === String(studentId), '无权限处理该绑定', 'FORBIDDEN', 403);
  ensure(b.status === 'pending', '状态不可变更', 'VALIDATION_ERROR', 422);
  if (action === 'approve') {
    b.status = 'approved';
  } else if (action === 'reject') {
    b.status = 'rejected';
  } else {
    ensure(false, '非法操作', 'VALIDATION_ERROR', 422);
  }
  b.actorLog.push({ actorId: studentId, action });
  await b.save();
  return { status: b.status };
}

async function listMyBindings(user) {
  if (user.role === 'teacher') {
    const list = await Binding.find({ teacherId: user.sub, status: { $in: ['pending', 'approved', 'pending-unbind'] } }).populate('studentId', 'name phone');
    return list.map(b => ({ _id: b._id, status: b.status, studentId: b.studentId._id, student: { _id: b.studentId._id, name: b.studentId.name, phone: b.studentId.phone } }));
  }
  if (user.role === 'student') {
    const list = await Binding.find({ studentId: user.sub, status: { $in: ['pending', 'approved', 'pending-unbind'] } }).populate('teacherId', 'name subject');
    return list.map(b => ({ _id: b._id, status: b.status, teacherId: b.teacherId._id, teacher: { _id: b.teacherId._id, name: b.teacherId.name, subject: b.teacherId.subject } }));
  }
  return [];
}

async function requestUnbind(studentId, bindingId) {
  const b = await Binding.findById(bindingId);
  ensure(b && String(b.studentId) === String(studentId), '无权限操作', 'FORBIDDEN', 403);
  ensure(b.status === 'approved', '仅已绑定可发起解绑', 'VALIDATION_ERROR', 422);
  b.status = 'pending-unbind';
  b.actorLog.push({ actorId: studentId, action: 'request-unbind' });
  await b.save();
  return { status: b.status };
}

async function listPendingUnbindForTeacher(teacherId) {
  const list = await Binding.find({ teacherId, status: 'pending-unbind' }).populate('studentId', 'name phone');
  return list.map(b => ({ _id: b._id, student: { _id: b.studentId._id, name: b.studentId.name, phone: b.studentId.phone } }));
}

async function processUnbind(teacherId, bindingId, action) {
  const b = await Binding.findById(bindingId);
  ensure(b && String(b.teacherId) === String(teacherId), '无权限操作', 'FORBIDDEN', 403);
  ensure(b.status === 'pending-unbind', '状态不可变更', 'VALIDATION_ERROR', 422);
  if (action === 'approve') {
    b.status = 'unbound';
  } else if (action === 'reject') {
    b.status = 'approved';
  } else {
    ensure(false, '非法操作', 'VALIDATION_ERROR', 422);
  }
  b.actorLog.push({ actorId: teacherId, action: `unbind-${action}` });
  await b.save();
  return { status: b.status };
}

module.exports = {
  createBinding,
  listPendingForStudent,
  processBinding,
  listMyBindings,
  requestUnbind,
  listPendingUnbindForTeacher,
  processUnbind,
};

