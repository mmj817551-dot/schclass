const { Schema, model, Types } = require('mongoose');

const OccupancySchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    slot: { type: String, enum: ['早1', '早2', '下1', '下2', '晚1'], required: true },
    reservedCount: { type: Number, default: 0 },
    lastReservationAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OccupancySchema.index({ roomId: 1, date: 1, slot: 1 }, { unique: true });

module.exports = model('Occupancy', OccupancySchema);

