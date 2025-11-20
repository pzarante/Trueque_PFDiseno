import express from 'express';
import { createProduct, updateProduct, DeleteProduct, changeStatus, getAllProducts } from '../controllers/offertsRobleController.js';
//import recaptchaMiddleware from '../middleware/recaptchaMiddleware.js';
import { validateFields } from "../middleware/validateFields.js";

const router = express.Router();

router.post('/OffertCreate', /*recaptchaMiddleware,*/ validateFields(['nombre', 'categoria', 'condicionesTrueque', 'comentarioNLP', 'ubicacion']), createProduct);
router.put('/OffertUpdate', validateFields(['nombre', 'condicionesTrueque', 'comentarioNLP', 'ubicacion']), updateProduct);
router.delete('/DelateOffert', validateFields(['nombre']), DeleteProduct);
router.put('/EditEstado', validateFields(['nombre', 'estado']), changeStatus);
router.get('/all-products', getAllProducts);

export default router;