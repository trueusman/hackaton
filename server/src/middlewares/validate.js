const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');

// Runs after an express-validator chain array; turns collected errors into
// one consistent AppError instead of leaking express-validator's own shape.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(AppError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
  }
  next();
}

module.exports = validate;
