const mongoose = require('mongoose');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Binding = require('../models/Binding');
const Config = require('../models/Config');

function httpError(message, status = 400, code = 'BAD_REQUEST', details) {
  const e = new Error(message);
  e.status = status;
  e.code = code;
  if (details) e.details = details;
  return e;
}

async function ensureSubjectAllowed(subject) {
  const cfg = await Config.findOne({ key: 'global' }).lean();
  if (cfg && Array.isArray(cfg.subjects) && cfg.subjects.length) {
    if (!cfg.subjects.includes(subject)) {
      throw httpError('\u79d1\u76ee\u975e\u6cd5', 422, 'VALIDATION_ERROR'); // 科目非法
    }
  }
}

// Slot keys and windows (分钟)
const SLOT_KEYS = ['\u65E91', '\u65E92', '\u4E0B1', '\u4E0B2', '\u665A1']; // 早1 早2 下1 下2 晚1
const SLOT_WINDOWS = [
  [480, 600], // 08:00-10:00
  [600, 720], // 10:00-12:00
  [840, 960], // 14:00-16:00
  [960, 1080], // 16:00-18:00
  [1140, 1260], // 19:00-21:00
];

function toMinutes(t) {
  const [h, m] = String(t || '00:00')
    .split(':')
    .map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

// 将具体时间段映射到“最近的”课时段（若距离相同，优先靠前的段）
function nearestSlotKey(start, end) {
  const stM = toMinutes(start);
  const etM = toMinutes(end);
  const mid = (stM + etM) / 2;
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < SLOT_WINDOWS.length; i += 1) {
    const [s, e] = SLOT_WINDOWS[i];
    const center = (s + e) / 2;
    const diff = Math.abs(mid - center);
    if (diff < bestDiff || (diff === bestDiff && i < bestIdx)) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return SLOT_KEYS[bestIdx];
}

async function createReservation(teacherId, payload) {
  const { roomId, subject, studentIds, intervals } = payload;

  await ensureSubjectAllowed(subject);

  const room = await Room.findById(roomId);
  if (!room) throw httpError('\u6559\u5ba4\u4e0d\u5b58\u5728', 404, 'NOT_FOUND'); // 教室不存在

  const inc = room.type === 'large' ? (Array.isArray(studentIds) ? studentIds.length : 0) : 1;
  const cap = room.capacity || 1;

  if (room.type === 'small') {
    if (!Array.isArray(studentIds) || studentIds.length !== 1) {
      throw httpError('\u5c0f\u6559\u5ba4\u9700\u4e14\u4ec5\u9650\u9009\u62e9 1 \u4f4d\u5b66\u751f', 422, 'VALIDATION_ERROR');
    }
  } else if (room.type === 'large') {
    if (Array.isArray(studentIds) && studentIds.length > cap) {
      throw httpError('\u8d85\u8fc7\u6559\u5ba4\u5bb9\u91cf\u9650\u5236', 409, 'CAPACITY_EXCEEDED');
    }
  }

  // 绑定关系校验：所有 studentIds 必须与 teacherId 为 approved 绑定
  if (!Array.isArray(studentIds) || !studentIds.length) {
    throw httpError('\u5b66\u751f\u4e0d\u80fd\u4e3a\u7a7a', 422, 'VALIDATION_ERROR');
  }
  const approved = await Binding.countDocuments({
    teacherId,
    studentId: { $in: studentIds },
    status: 'approved',
  });
  if (approved !== studentIds.length) {
    throw httpError('\u5b58\u5728\u672a\u7ed1\u5b9a\u5b66\u751f\uff0c\u65e0\u6cd5\u9884\u7ea6', 422, 'VALIDATION_ERROR');
  }

  // 基础校验：时间段合法
  if (!Array.isArray(intervals) || !intervals.length) {
    throw httpError('\u65f6\u95f4\u6bb5\u4e0d\u80fd\u4e3a\u7a7a', 422, 'VALIDATION_ERROR');
  }
  for (const iv of intervals) {
    if (!iv || !iv.date || !iv.start || !iv.end) {
      throw httpError('\u65f6\u95f4\u6bb5\u4e0d\u5b8c\u6574', 422, 'VALIDATION_ERROR');
    }
    if (iv.start >= iv.end) {
      throw httpError('\u8d77\u59cb\u65f6\u95f4\u5fc5\u987b\u65e9\u4e8e\u7ed3\u675f\u65f6\u95f4', 422, 'VALIDATION_ERROR');
    }
  }

  const session = await mongoose.startSession();
  let createdDoc = null;
  try {
    await session.withTransaction(async () => {
      // enforce capacity per (roomId,date,time-range)
      for (const iv of intervals) {
        const st = iv.start;
        const et = iv.end;
        // 查找同一天相交的预约
        const overlapped = await Reservation.find({
          roomId,
          intervals: { $elemMatch: { date: iv.date, start: { $lt: et }, end: { $gt: st } } },
        })
          .session(session)
          .lean();

        if (room.type === 'small') {
          if (overlapped.length) {
            throw httpError('\u8be5\u65f6\u95f4\u6bb5\u5df2\u88ab\u5360\u7528', 409, 'RESERVATION_CONFLICT', {
              conflicts: [iv],
            });
          }
        } else {
          // 大教室：并发人数不超过容量
          const used = overlapped.reduce(
            (sum, r) => sum + (Array.isArray(r.studentIds) ? r.studentIds.length : 0),
            0,
          );
          if (used + inc > cap) {
            throw httpError('\u8d85\u8fc7\u6559\u5ba4\u5bb9\u91cf\u9650\u5236', 409, 'CAPACITY_EXCEEDED', {
              conflicts: [iv],
              used,
            });
          }
        }
      }

      // 由 intervals 推导兼容 slots（用于报表 / 旧前端），采用“最近课时段”策略
      const slotSet = new Set();
      for (const iv of intervals) {
        const keySlot = nearestSlotKey(iv.start, iv.end);
        slotSet.add(`${iv.date}__${keySlot}`);
      }
      const derivedSlots = Array.from(slotSet).map((key) => {
        const [date, slot] = key.split('__');
        return { date, slot };
      });

      const created = await Reservation.create(
        [{ roomId, teacherId, studentIds, subject, intervals, slots: derivedSlots }],
        { session },
      );
      createdDoc = created[0];
    });
  } finally {
    session.endSession();
  }
  return { reservationId: createdDoc?._id };
}

async function getReservation(id) {
  const r = await Reservation.findById(id)
    .populate('teacherId', 'name subject')
    .populate('studentIds', 'name')
    .lean();
  if (!r) throw httpError('\u9884\u7ea6\u4e0d\u5b58\u5728', 404, 'NOT_FOUND'); // 预约不存在
  return normalizeReservation(r);
}

async function deleteReservation(id, requester) {
  const r = await Reservation.findById(id);
  if (!r) throw httpError('\u9884\u7ea6\u4e0d\u5b58\u5728', 404, 'NOT_FOUND');
  if (!(requester.role === 'admin' || String(r.teacherId) === requester.sub)) {
    throw httpError('\u65e0\u6743\u64cd\u4f5c', 403, 'FORBIDDEN');
  }
  await Reservation.deleteOne({ _id: r._id });
  return { success: true };
}

function normalizeReservation(r) {
  const teacherId = r.teacherId && r.teacherId._id ? r.teacherId._id : r.teacherId;
  const teacher =
    r.teacherId && r.teacherId.name
      ? { _id: teacherId, name: r.teacherId.name, subject: r.teacherId.subject }
      : undefined;

  const studentsArray = Array.isArray(r.studentIds) ? r.studentIds : [];
  const studentIds = studentsArray
    .map((s) => (s && s._id ? s._id : s))
    .filter((v) => v != null);
  const students =
    studentsArray && studentsArray.length
      ? studentsArray
          .filter((s) => s && s._id && s.name)
          .map((s) => ({ _id: s._id, name: s.name }))
      : undefined;

  return {
    _id: r._id,
    roomId: r.roomId,
    subject: r.subject,
    teacher,
    teacherId,
    studentIds,
    students,
    intervals: r.intervals,
    slots: r.slots, // 兼容输出
  };
}

function rangeQuery(from, to) {
  return { 'intervals.date': { $gte: from, $lte: to } };
}

async function listRoomReservations(roomId, from, to) {
  const q = { roomId, ...rangeQuery(from, to) };
  const list = await Reservation.find(q)
    .populate('teacherId', 'name subject')
    .populate('studentIds', 'name')
    .lean();
  return list.map(normalizeReservation);
}

async function listReservations({ from, to, roomId }) {
  const q = { ...rangeQuery(from, to) };
  if (roomId) q.roomId = roomId;
  const list = await Reservation.find(q)
    .populate('teacherId', 'name subject')
    .populate('studentIds', 'name')
    .lean();
  return list.map(normalizeReservation);
}

async function listMy({ from, to, role }, user) {
  const q = { ...rangeQuery(from, to) };
  if (role === 'teacher') {
    q.teacherId = user.sub;
  } else {
    q.studentIds = user.sub;
  }
  const list = await Reservation.find(q)
    .populate('teacherId', 'name subject')
    .populate('studentIds', 'name')
    .lean();
  return list.map(normalizeReservation);
}

async function listHistory({ from, to, role }, user) {
  return listMy({ from, to, role }, user);
}

module.exports = {
  createReservation,
  getReservation,
  deleteReservation,
  listRoomReservations,
  listReservations,
  listMy,
  listHistory,
};

