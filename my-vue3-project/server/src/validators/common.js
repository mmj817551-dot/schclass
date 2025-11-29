const Joi = require('joi');

const dateStr = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
// HH:MM 24小时制
const timeStr = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/);
// 兼容旧版课时段（暂留）
const slot = Joi.string().valid('\u65E91', '\u65E92', '\u4E0B1', '\u4E0B2', '\u665A1');
const objectId = Joi.string().hex().length(24);

module.exports = { Joi, dateStr, timeStr, slot, objectId };
