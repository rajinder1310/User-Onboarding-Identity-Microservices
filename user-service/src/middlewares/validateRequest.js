const { sendError } = require('../utils/responseHandler');

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return sendError(res, 400, 'Validation Error', error.errors);
  }
};

module.exports = validateRequest;
