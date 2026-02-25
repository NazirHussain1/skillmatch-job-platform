import express from 'express';
import { body } from 'express-validator';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs
} from '../controllers/jobController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';

const router = express.Router();

// Validation middleware
const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('salary').trim().notEmpty().withMessage('Salary is required'),
  body('type').isIn(['Full-time', 'Part-time', 'Contract', 'Remote']).withMessage('Invalid job type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill is required')
];

router.get('/', getJobs);
router.get('/employer/my-jobs', protect, authorize('EMPLOYER'), getEmployerJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('EMPLOYER'), jobValidation, createJob);
router.put('/:id', protect, authorize('EMPLOYER'), updateJob);
router.delete('/:id', protect, authorize('EMPLOYER'), deleteJob);

export default router;
