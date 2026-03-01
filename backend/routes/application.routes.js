const express = require('express');
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createApplicationValidator,
  updateApplicationStatusValidator,
  applicationIdValidator
} = require('../validators/application.validator');

const router = express.Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, authorize('jobseeker'), createApplicationValidator, validate, createApplication);

router.route('/:id')
  .put(protect, authorize('employer', 'admin'), updateApplicationStatusValidator, validate, updateApplicationStatus)
  .delete(protect, applicationIdValidator, validate, deleteApplication);

module.exports = router;
