import express from 'express';
import { getProfile, updateProfile, getReputation, deactivateAccount } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/reputation', authMiddleware, getReputation);
router.post('/deactivate', authMiddleware, deactivateAccount);

export default router;
