import express from 'express';
import { createRating, getUserRatings, checkRatingStatus } from '../controllers/ratingsController.js';
import { validateFields } from "../middleware/validateFields.js";

const router = express.Router();

router.post('/', validateFields(['tradeId', 'ratedUserId', 'rating']), createRating);
router.get('/:userId', getUserRatings);
router.get('/trade/:tradeId/status', checkRatingStatus);

export default router;

