import express from 'express';
import { createProduct, updateProduct, DeleteProduct, changeStatus } from '../controllers/offertsRobleController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/OffertCreate', upload.array('imagenes', 3),createProduct);
router.put('/OffertUpdate',  updateProduct);
router.delete('/DelateOffert', DeleteProduct);
router.put('/EditEstado', changeStatus);

export default router;


