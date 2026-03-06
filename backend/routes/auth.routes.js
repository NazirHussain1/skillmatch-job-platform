const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile, forgotPassword, resetPassword, verifyEmail, resendVerification } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

const router = express.Router();

const createAuthLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again in 15 minutes.'
    }
  });

const registerLimiter = createAuthLimiter();
const loginLimiter = createAuthLimiter();

router.post('/register', registerLimiter, registerValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
