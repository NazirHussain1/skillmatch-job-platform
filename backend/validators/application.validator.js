const { body, param } = require('express-validator');

const createApplicationValidator = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cover letter must not exceed 1000 characters')
];

const updateApplicationStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'])
    .withMessage('Invalid status value'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

const applicationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID')
];

module.exports = {
  createApplicationValidator,
  updateApplicationStatusValidator,
  applicationIdValidator
};
