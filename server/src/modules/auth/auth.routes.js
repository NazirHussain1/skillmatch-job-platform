import express from 'express';
import * as authController from './auth.controller.js';
import * as authValidation from './auth.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/security.middleware.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/verify-2fa', authLimiter, validate(authValidation.verify2FA), authController.verify2FA);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(authValidation.resetPassword), authController.resetPassword);
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerificationEmail);

// Protected routes
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);
router.post('/change-password', protect, validate(authValidation.changePassword), authController.changePassword);
router.post('/enable-2fa', protect, authController.enable2FA);
router.post('/disable-2fa', protect, authController.disable2FA);

export default router;
