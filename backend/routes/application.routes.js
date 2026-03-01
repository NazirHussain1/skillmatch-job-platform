const express = require('express');
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, authorize('JOB_SEEKER'), createApplication);

router.route('/:id')
  .put(protect, authorize('EMPLOYER', 'ADMIN'), updateApplicationStatus)
  .delete(protect, deleteApplication);

module.exports = router;
