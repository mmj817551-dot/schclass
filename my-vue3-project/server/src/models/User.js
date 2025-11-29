const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['teacher', 'student', 'admin'], required: true },
    passwordHash: { type: String, required: true },
    subject: { type: String }, // teacher only
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);

