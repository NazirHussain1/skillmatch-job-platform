import express from 'express';
import { updateProfile, getAnalytics } from '../controllers/userController.jsx';
import { protect } from '../middleware/auth.jsx';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/analytics', protect, getAnalytics);

export default router;
