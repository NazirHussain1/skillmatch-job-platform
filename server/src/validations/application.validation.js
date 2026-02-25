import { body } from 'express-validator';

export const createApplicationValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID'),
  
  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('matchScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Match score must be between 0 and 100')
];

export const updateApplicationStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'])
    .withMessage('Invalid status')
];
