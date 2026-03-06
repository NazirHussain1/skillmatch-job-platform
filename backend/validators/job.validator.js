const { body, param } = require('express-validator');

const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isNumeric()
    .withMessage('Salary must be a number'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'remote', 'internship', 'contract'])
    .withMessage('Invalid job type')
];

const updateJobValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job title cannot be empty'),
  
  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'remote', 'internship', 'contract'])
    .withMessage('Invalid job type')
];

const jobIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID')
];

module.exports = {
  createJobValidator,
  updateJobValidator,
  jobIdValidator
};
