const { Schema, model } = require('mongoose');

const ConfigSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },
    subjects: { type: [String], default: [] },
    slotDisplayMap: { type: Object, default: { '早1': '早1', '早2': '早2', '下1': '下1', '下2': '下2', '晚1': '晚1' } },
    largeRoomCapacity: { type: Number, default: 10 },
    weekStart: { type: String, enum: ['monday', 'sunday'], default: 'monday' },
    timezone: { type: String, default: 'Asia/Shanghai' },
  },
  { timestamps: true }
);

module.exports = model('Config', ConfigSchema);

