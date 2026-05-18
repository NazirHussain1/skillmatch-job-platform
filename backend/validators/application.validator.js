const { body, param } = require('express-validator');

const APPLICATION_STATUSES = [
  'pending',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'accepted',
  'rejected'
];

const jobIdValidator = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID')
];

const updateApplicationStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(APPLICATION_STATUSES)
    .withMessage('Invalid application status'),

  body('employerNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),

  body('interviewDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Interview date must be a valid date'),

  body('historyNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('History note cannot exceed 500 characters')
];

module.exports = {
  APPLICATION_STATUSES,
  jobIdValidator,
  updateApplicationStatusValidator
};
