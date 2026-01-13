const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const sendError = (res, statusCode, message, error = null) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    error
  });
};

module.exports = { sendSuccess, sendError };
