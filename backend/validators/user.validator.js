const { body, param } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),
  
  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  
  body('profilePicture')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
];

const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Role must be jobseeker, employer, or admin'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const userIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

module.exports = {
  updateProfileValidator,
  updateUserValidator,
  userIdValidator
};
