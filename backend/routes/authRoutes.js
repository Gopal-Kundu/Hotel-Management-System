import express from 'express';
import { register, login, logout, getMe, generateOtp, verifyOtp } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', isAuthenticated, getMe);

export default router;
