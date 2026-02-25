import { body, query } from 'express-validator';

export const createJobValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('salary')
    .trim()
    .notEmpty()
    .withMessage('Salary range is required'),
  
  body('type')
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Remote'])
    .withMessage('Invalid job type'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),
  
  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required')
];

export const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('type')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Remote'])
    .withMessage('Invalid job type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters')
];

export const getJobsValidation = [
  query('search')
    .optional()
    .trim(),
  
  query('location')
    .optional()
    .trim(),
  
  query('type')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Remote'])
    .withMessage('Invalid job type'),
  
  query('skills')
    .optional()
    .trim()
];
