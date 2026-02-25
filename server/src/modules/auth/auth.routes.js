import express from 'express';
import { signup, login, getMe } from './auth.controller.js';
import { protect } from '../../middlewares/auth.js';
import { signupValidation, loginValidation } from '../../validations/auth.validation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
