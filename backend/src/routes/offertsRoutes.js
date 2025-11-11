import express from 'express';
import { createProduct, updateProduct, DeleteProduct, changeStatus } from '../controllers/offertsRobleController.js';

const router = express.Router();

router.post('/OffertCreate', createProduct);
router.put('/OffertUpdate',  updateProduct);
router.delete('/DelateOffert', DeleteProduct);
router.put('/EditEstado', changeStatus);

export default router;


