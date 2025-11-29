// 占位：初始化 7 小 + 1 大 教室、Config、管理员（可选）
// 运行：npm run seed
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { connect } = require('../config/db');
const Room = require('../models/Room');
const Config = require('../models/Config');
const User = require('../models/User');

async function main() {
  await connect();
  const exists = await Config.findOne();
  if (!exists) {
    await Config.create({
      subjects: env.INITIAL_SUBJECTS,
      largeRoomCapacity: env.LARGE_ROOM_CAPACITY_DEFAULT,
      weekStart: 'monday',
      timezone: env.TZ,
    });
    console.log('Config inited');
  }
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    const smalls = Array.from({ length: 7 }).map((_, i) => ({ name: `小教室${i + 1}`, type: 'small', capacity: 1 }));
    const large = { name: '大教室1', type: 'large', capacity: env.LARGE_ROOM_CAPACITY_DEFAULT };
    await Room.insertMany([...smalls, large]);
    console.log('Rooms inited');
  }
  if (env.ADMIN_PHONE && env.ADMIN_PASSWORD) {
    const admin = await User.findOne({ phone: env.ADMIN_PHONE });
    if (!admin) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await User.create({ name: '管理员', phone: env.ADMIN_PHONE, role: 'admin', passwordHash });
      console.log('Admin created');
    }
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

