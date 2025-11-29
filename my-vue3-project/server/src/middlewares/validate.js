const Joi = require('joi');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      const err = new Error('参数校验失败');
      err.status = 422; err.code = 'VALIDATION_ERROR';
      err.details = error.details.map(d => ({ message: d.message, path: d.path }));
      return next(err);
    }
    req[source] = value;
    return next();
  };
}

module.exports = { validate };

