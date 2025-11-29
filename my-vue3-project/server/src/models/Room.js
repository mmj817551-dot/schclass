const { Schema, model } = require('mongoose');

const RoomSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['small', 'large'], required: true, index: true },
    capacity: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Room', RoomSchema);

