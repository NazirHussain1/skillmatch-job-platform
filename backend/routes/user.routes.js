const express = require('express');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  uploadCompanyLogo
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const {
  updateProfileValidator,
  updateUserValidator,
  userIdValidator
} = require('../validators/user.validator');

const router = express.Router();

// Profile routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfileValidator, validate, updateProfile);

// Profile picture upload
router.post('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Company logo upload (employer only)
router.post('/profile/company-logo', protect, authorize('employer'), upload.single('companyLogo'), uploadCompanyLogo);

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), userIdValidator, validate, getUserById)
  .put(protect, authorize('admin'), updateUserValidator, validate, updateUser)
  .delete(protect, authorize('admin'), userIdValidator, validate, deleteUser);

module.exports = router;
