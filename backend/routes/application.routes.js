const express = require('express');
const {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  jobIdValidator,
  applicationIdValidator,
  updateApplicationStatusValidator
} = require('../validators/application.validator');

const router = express.Router();

// Get my applications
router.get('/my', protect, getMyApplications);

// Get applications for a specific job (employer only)
router.get('/job/:jobId', protect, authorize('employer'), jobIdValidator, validate, getJobApplications);

// Create application (jobseeker only)
router.post('/:jobId', protect, authorize('jobseeker'), jobIdValidator, validate, createApplication);

// Update application status (employer only)
router.put('/:id', protect, authorize('employer'), updateApplicationStatusValidator, validate, updateApplicationStatus);

module.exports = router;
