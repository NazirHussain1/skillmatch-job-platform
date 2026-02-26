import express from 'express';
import {
  searchJobs,
  getSearchHistory,
  deleteSearchHistory,
  clearSearchHistory
} from './search.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/jobs', searchJobs);

// Protected routes
router.get('/history', protect, getSearchHistory);
router.delete('/history', protect, clearSearchHistory);
router.delete('/history/:id', protect, deleteSearchHistory);

export default router;
