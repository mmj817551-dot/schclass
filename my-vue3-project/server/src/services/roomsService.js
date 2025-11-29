const Room = require('../models/Room');

async function listRooms() {
  const rooms = await Room.find({ enabled: { $ne: false } }).sort({ type: 1, name: 1 });
  return rooms.map(r => ({ _id: r._id, name: r.name, type: r.type, capacity: r.capacity, enabled: r.enabled }));
}

module.exports = { listRooms };

