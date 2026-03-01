const { body, param } = require('express-validator');

const jobIdValidator = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID')
];

const applicationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID')
];

const updateApplicationStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'accepted', 'rejected'])
    .withMessage('Status must be pending, accepted, or rejected')
];

module.exports = {
  jobIdValidator,
  applicationIdValidator,
  updateApplicationStatusValidator
};
