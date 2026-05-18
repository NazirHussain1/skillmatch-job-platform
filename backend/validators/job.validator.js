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

  body('salaryMin')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .custom((value) => Number(value) >= 0)
    .withMessage('Minimum salary cannot be negative'),

  body('salaryMax')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .custom((value, { req }) => {
      if (req.body.salaryMin === undefined || req.body.salaryMin === '') {
        return Number(value) >= 0;
      }
      return Number(value) >= Number(req.body.salaryMin);
    })
    .withMessage('Maximum salary must be greater than or equal to minimum salary'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'remote', 'internship', 'contract'])
    .withMessage('Invalid job type'),

  body('workplaceType')
    .optional()
    .isIn(['on-site', 'hybrid', 'remote'])
    .withMessage('Invalid workplace type'),

  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each skill must be 60 characters or fewer'),

  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),

  body('benefits.*')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('Each benefit must be 80 characters or fewer'),

  body('applicationDeadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Application deadline must be a valid date'),

  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('Urgent flag must be true or false'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Software Development', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'HR', 'Other'])
    .withMessage('Invalid category')
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

  body('salaryMin')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .custom((value) => Number(value) >= 0)
    .withMessage('Minimum salary cannot be negative'),

  body('salaryMax')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .custom((value, { req }) => {
      if (req.body.salaryMin === undefined || req.body.salaryMin === '') {
        return Number(value) >= 0;
      }
      return Number(value) >= Number(req.body.salaryMin);
    })
    .withMessage('Maximum salary must be greater than or equal to minimum salary'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'remote', 'internship', 'contract'])
    .withMessage('Invalid job type'),

  body('workplaceType')
    .optional()
    .isIn(['on-site', 'hybrid', 'remote'])
    .withMessage('Invalid workplace type'),

  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each skill must be 60 characters or fewer'),

  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),

  body('benefits.*')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('Each benefit must be 80 characters or fewer'),

  body('applicationDeadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Application deadline must be a valid date'),

  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('Urgent flag must be true or false'),
  
  body('category')
    .optional()
    .isIn(['Software Development', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'HR', 'Other'])
    .withMessage('Invalid category')
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
