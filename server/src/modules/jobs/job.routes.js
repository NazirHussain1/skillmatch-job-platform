import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs
} from './job.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';
import {
  createJobValidation,
  updateJobValidation,
  getJobsValidation
} from '../../validations/job.validation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.get('/', getJobsValidation, validate, getJobs);
router.get('/employer/my-jobs', protect, authorize('EMPLOYER'), getEmployerJobs);
router.get('/:id', getJobById);

router.post(
  '/',
  protect,
  authorize('EMPLOYER'),
  createJobValidation,
  validate,
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('EMPLOYER'),
  updateJobValidation,
  validate,
  updateJob
);

router.delete('/:id', protect, authorize('EMPLOYER'), deleteJob);

export default router;
