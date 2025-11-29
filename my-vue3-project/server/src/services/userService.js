const User = require('../models/User');
const Binding = require('../models/Binding');

async function searchStudents({ name, phone, page = 1, pageSize = 20 }) {
  const query = { role: 'student' };
  const or = [];
  if (name) or.push({ name: new RegExp(name, 'i') });
  if (phone) or.push({ phone: new RegExp(phone, 'i') });
  if (or.length) query.$or = or;
  const skip = (Math.max(1, page) - 1) * Math.max(1, pageSize);
  const [items, total] = await Promise.all([
    User.find(query).sort({ _id: -1 }).skip(skip).limit(pageSize).select('_id name phone'),
    User.countDocuments(query),
  ]);
  return { items, meta: { page, pageSize, total } };
}

async function getTeacherStudents(teacherId) {
  const bindings = await Binding.find({ teacherId, status: 'approved' }).populate('studentId', 'name phone');
  return bindings.map(b => ({ _id: b.studentId._id, name: b.studentId.name, phone: b.studentId.phone }));
}

module.exports = { searchStudents, getTeacherStudents };
