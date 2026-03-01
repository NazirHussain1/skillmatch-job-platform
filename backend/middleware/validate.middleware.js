const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return ApiResponse.error(res, errorMessages, 400);
  }
  
  next();
};

module.exports = validate;
