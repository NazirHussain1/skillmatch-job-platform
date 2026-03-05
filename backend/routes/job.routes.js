const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createJobValidator,
  updateJobValidator,
  jobIdValidator
} = require('../validators/job.validator');

const router = express.Router();

// Job statistics (employer only)
router.get('/stats', protect, authorize('employer'), getJobStats);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer'), createJobValidator, validate, createJob);

router.route('/:id')
  .get(jobIdValidator, validate, getJob)
  .put(protect, authorize('employer'), updateJobValidator, validate, updateJob)
  .delete(protect, authorize('employer'), jobIdValidator, validate, deleteJob);

// Update job status
router.patch('/:id/status', protect, authorize('employer'), updateJobStatus);

module.exports = router;
