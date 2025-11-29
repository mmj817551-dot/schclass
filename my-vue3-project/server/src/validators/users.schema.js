const { Joi } = require('./common');

const searchStudents = Joi.object({
  name: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { searchStudents };

