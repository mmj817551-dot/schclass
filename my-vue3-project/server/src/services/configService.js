const Config = require('../models/Config');

async function getConfig() {
  let cfg = await Config.findOne({ key: 'global' });
  if (!cfg) {
    cfg = await Config.create({ key: 'global' });
  }
  return cfg.toObject();
}

async function updateConfig(patch) {
  const cfg = await Config.findOneAndUpdate({ key: 'global' }, { $set: patch }, { new: true, upsert: true });
  return cfg.toObject();
}

module.exports = { getConfig, updateConfig };

