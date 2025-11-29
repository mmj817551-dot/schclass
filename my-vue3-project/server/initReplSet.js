// initReplSet.js
const mongoose = require('mongoose');

async function main() {
  try {
    // 连接到 admin 库（注意这里连的是 27017，不带 replicaSet 参数）
    await mongoose.connect('mongodb://127.0.0.1:27017/admin', {
      autoIndex: false,
    });

    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [{ _id: 0, host: '127.0.0.1:27017' }],
      },
    });

    console.log('replSetInitiate result:', result);
  } catch (err) {
    console.error('Error during replSetInitiate:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
