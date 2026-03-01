const { body, param } = require('express-validator');

const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
];

const updateJobValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number')
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
