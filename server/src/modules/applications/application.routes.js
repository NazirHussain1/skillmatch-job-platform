import express from 'express';
import {
  getApplications,
  getEmployerApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} from './application.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';
import {
  createApplicationValidation,
  updateApplicationStatusValidation
} from '../../validations/application.validation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('JOB_SEEKER'), getApplications);
router.get('/employer', authorize('EMPLOYER'), getEmployerApplications);

router.post(
  '/',
  authorize('JOB_SEEKER'),
  createApplicationValidation,
  validate,
  createApplication
);

router.put(
  '/:id',
  authorize('EMPLOYER'),
  updateApplicationStatusValidation,
  validate,
  updateApplicationStatus
);

router.delete('/:id', authorize('JOB_SEEKER'), deleteApplication);

export default router;
