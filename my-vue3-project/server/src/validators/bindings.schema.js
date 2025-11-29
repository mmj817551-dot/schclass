const { Joi, objectId } = require('./common');

const create = Joi.object({
  studentId: objectId.required(),
});

const process = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
});

const processUnbind = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
});

module.exports = { create, process, processUnbind };

