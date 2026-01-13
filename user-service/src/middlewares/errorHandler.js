const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 400, 'Duplicate field value entered', err.errors[0].message);
  }

  if (err.name === 'SequelizeValidationError') {
    return sendError(res, 400, 'Validation Error', err.errors.map(e => e.message));
  }

  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  console.error('ERROR 💥', err);
  sendError(res, 500, 'Something went wrong');
};

module.exports = errorHandler;
