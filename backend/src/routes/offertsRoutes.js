import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createProduct, updateProduct, deleteProduct, changeStatus } from '../controllers/offertsController.js';

const router = express.Router();

router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.patch('/:id/estado', authMiddleware, changeStatus);

export default router;


