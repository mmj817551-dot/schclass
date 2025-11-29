const { Joi, dateStr, timeStr, objectId } = require('./common');

const create = Joi.object({
  roomId: objectId.required(),
  subject: Joi.string().min(1).required(),
  studentIds: Joi.array().items(objectId).min(1).required(),
  intervals: Joi.array()
    .items(
      Joi.object({
        date: dateStr.required(),
        start: timeStr.required(),
        end: timeStr.required(),
      })
    )
    .min(1)
    .required(),
});

const listRange = Joi.object({
  from: dateStr.required(),
  to: dateStr.required(),
  roomId: objectId.optional(),
});

module.exports = { create, listRange };
