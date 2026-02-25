import express from 'express';
import { body } from 'express-validator';
import {
  getApplications,
  getEmployerApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';

const router = express.Router();

// Validation middleware
const applicationValidation = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required')
];

router.get('/', protect, getApplications);
router.get('/employer', protect, authorize('EMPLOYER'), getEmployerApplications);
router.post('/', protect, authorize('JOB_SEEKER'), applicationValidation, createApplication);
router.put('/:id', protect, authorize('EMPLOYER'), updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

export default router;
