const { Schema, model, Types } = require('mongoose');

const BindingSchema = new Schema(
  {
    teacherId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'pending-unbind', 'unbound', 'rejected'], default: 'pending', index: true },
    actorLog: [{ actorId: Types.ObjectId, action: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

BindingSchema.index(
  { teacherId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'approved', 'pending-unbind'] } } }
);

module.exports = model('Binding', BindingSchema);

