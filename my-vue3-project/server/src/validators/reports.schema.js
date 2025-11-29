const { Joi } = require('./common');

const monthly = Joi.object({
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
  format: Joi.string().valid('csv', 'pdf').default('csv'),
});

module.exports = { monthly };

