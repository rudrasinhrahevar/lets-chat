import express from 'express';
import { register, verifyOTP, login, refreshTokenHandler, logout, setupTwoStep, verifyTwoStep, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/setup-2fa', protect, setupTwoStep);
router.post('/verify-2fa', verifyTwoStep);

export default router;
