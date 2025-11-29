const { Joi } = require('./common');

const register = Joi.object({
  role: Joi.string().valid('teacher', 'student').required(),
  name: Joi.string().min(1).required(),
  phone: Joi.string().min(6).required(),
  password: Joi.string().min(6).required(),
  subject: Joi.when('role', { is: 'teacher', then: Joi.string().min(1).required(), otherwise: Joi.forbidden() }),
});

const login = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { register, login };

