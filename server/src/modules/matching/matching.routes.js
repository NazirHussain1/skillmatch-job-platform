import express from 'express';
import {
  getSkillGap,
  getJobRecommendations,
  getCandidateRecommendations
} from './matching.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/skill-gap/:jobId', authorize('JOB_SEEKER'), getSkillGap);
router.get('/recommendations/jobs', authorize('JOB_SEEKER'), getJobRecommendations);
router.get('/recommendations/candidates/:jobId', authorize('EMPLOYER'), getCandidateRecommendations);

export default router;
