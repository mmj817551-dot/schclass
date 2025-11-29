const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/teacher-scheduler',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  TZ: process.env.TZ || 'Asia/Shanghai',
  INITIAL_SUBJECTS: (process.env.INITIAL_SUBJECTS || '语文,数学,英语,物理,化学,生物,地理,政治,历史').split(','),
  LARGE_ROOM_CAPACITY_DEFAULT: parseInt(process.env.LARGE_ROOM_CAPACITY_DEFAULT || '10', 10),
  ADMIN_PHONE: process.env.ADMIN_PHONE || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
};

module.exports = env;

