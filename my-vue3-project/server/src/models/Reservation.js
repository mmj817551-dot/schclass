const { Schema, model, Types } = require('mongoose');

// 兼容旧版：课时段（如 早1/早2/下1/下2/晚1）
const SlotSchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    slot: { type: String, required: true }, // 保留旧值，服务端不再依赖其判重
  },
  { _id: false }
);

// 新版：基于具体时间段
const IntervalSchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // HH:MM
    end: { type: String, required: true },   // HH:MM
  },
  { _id: false }
);

const ReservationSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true, index: true },
    teacherId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    studentIds: [{ type: Types.ObjectId, ref: 'User' }],
    subject: { type: String, required: true },
    intervals: { type: [IntervalSchema], required: true },
    // 兼容字段：由 intervals 推导填充，供过渡期报表/旧前端使用
    slots: { type: [SlotSchema], default: undefined },
  },
  { timestamps: true }
);

ReservationSchema.index({ 'intervals.date': 1 });
ReservationSchema.index({ 'intervals.start': 1 });
ReservationSchema.index({ 'intervals.end': 1 });

module.exports = model('Reservation', ReservationSchema);

