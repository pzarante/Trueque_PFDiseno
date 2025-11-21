import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, resendVerificationCode } from '../controllers/authRobleController.js';
import { validateFields } from "../middleware/validateFields.js";
import recaptchaMiddleware from '../middleware/recaptchaMiddleware.js';

const router = express.Router();

router.post('/register', validateFields(['name', 'email', 'password']), recaptchaMiddleware, register);
router.post('/login', validateFields(['email', 'password']), recaptchaMiddleware, login);
router.post('/verify', verifyEmail);
router.post('/resend-verification', validateFields(['email']), resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
