const express = require('express');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  uploadCompanyLogo,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');
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

// Resume upload (jobseeker only)
router.post('/profile/resume', protect, authorize('jobseeker'), uploadDocument.single('resume'), uploadResume);

// Saved jobs routes (jobseeker only)
router.get('/saved-jobs', protect, authorize('jobseeker'), getSavedJobs);
router.post('/saved-jobs/:jobId', protect, authorize('jobseeker'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('jobseeker'), unsaveJob);

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), userIdValidator, validate, getUserById)
  .put(protect, authorize('admin'), updateUserValidator, validate, updateUser)
  .delete(protect, authorize('admin'), userIdValidator, validate, deleteUser);

module.exports = router;
