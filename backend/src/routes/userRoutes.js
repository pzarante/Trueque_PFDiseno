import express from 'express';
import { getProfile, updateProfile/*, getReputation*/, deactivateAccount,getProducts, filters } from '../controllers/userRobleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile',getProfile);
router.put('/update',updateProfile);
/*outer.get('/reputation', authMiddleware, getReputation);*/
router.post('/deactivate',   deactivateAccount);
router.get('/productos',getProducts);
router.get('/search',filters);

export default router;
