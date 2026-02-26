import express from 'express';
import {
  getEmployerAnalytics,
  getAdminAnalytics,
  trackJobView
} from './analytics.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/employer', authorize('EMPLOYER'), getEmployerAnalytics);
router.get('/admin', authorize('ADMIN'), getAdminAnalytics);
router.post('/jobs/:jobId/view', trackJobView);

export default router;
