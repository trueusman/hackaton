const AppError = require('../errors/AppError');

function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// Last middleware in app.js - the single place API error responses are shaped.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let error = err;

  if (err.name === 'ValidationError') {
    error = AppError.badRequest(err.message, 'VALIDATION_ERROR');
  } else if (err.name === 'CastError') {
    error = AppError.badRequest(`Invalid identifier: ${err.value}`, 'INVALID_ID');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = AppError.conflict(`Duplicate value for '${field}'`, 'DUPLICATE_KEY');
  } else if (!err.isOperational) {
    error = new (require('../errors/AppError'))(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      err.statusCode || 500,
      'INTERNAL_ERROR',
    );
  }

  if (!error.isOperational) {
    console.error('[unhandled error]', err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    code: error.code || 'INTERNAL_ERROR',
    ...(error.details ? { details: error.details } : {}),
  });
}

module.exports = { errorHandler, notFoundHandler };
