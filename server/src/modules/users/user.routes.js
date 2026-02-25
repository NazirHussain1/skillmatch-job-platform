import express from 'express';
import { updateProfile, getAnalytics } from './user.controller.js';
import { protect } from '../../middlewares/auth.js';
import { updateProfileValidation } from '../../validations/user.validation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfileValidation, validate, updateProfile);
router.get('/analytics', getAnalytics);

export default router;
