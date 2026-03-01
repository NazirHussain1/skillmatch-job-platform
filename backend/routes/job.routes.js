const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, authorize('EMPLOYER', 'ADMIN'), createJob);

router.route('/:id')
  .get(getJob)
  .put(protect, authorize('EMPLOYER', 'ADMIN'), updateJob)
  .delete(protect, authorize('EMPLOYER', 'ADMIN'), deleteJob);

module.exports = router;
