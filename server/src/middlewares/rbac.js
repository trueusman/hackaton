const AppError = require('../errors/AppError');

// Backend-enforced authorization - the brief explicitly scores this over
// frontend-only "hide the button" role checks.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized());
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(AppError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`));
  }
  next();
};

module.exports = { authorize };
