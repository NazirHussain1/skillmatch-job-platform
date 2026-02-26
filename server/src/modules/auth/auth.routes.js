import express from 'express';
import { signup, login, refreshToken, logout, getMe } from './auth.controller.js';
import { protect } from '../../middlewares/auth.js';
import { signupValidation, loginValidation } from '../../validations/auth.validation.js';
import { validate } from '../../middlewares/validate.js';
import { loginLimiter } from '../../config/security.js';

const router = express.Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
