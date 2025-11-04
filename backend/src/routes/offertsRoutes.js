import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createProduct, updateProduct, deleteProduct, changeStatus } from '../controllers/offertsController.js';

const router = express.Router();

router.post('/OffertCreate', createProduct);
router.put('/OffertUpdate',  updateProduct);
router.delete('/DelateOffert:id', deleteProduct);
router.patch('/EditEstado', changeStatus);

export default router;


