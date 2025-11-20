import express from 'express';
import { createTradeProposal, confirmTrade, getUserTrades } from '../controllers/truequesController.js';
import { validateFields } from "../middleware/validateFields.js";

const router = express.Router();

router.post('/propose', validateFields(['id_producto_oferente', 'id_producto_destinatario']), createTradeProposal);
router.put('/:tradeId/confirm', validateFields(['accion']), confirmTrade); // accion: 'aceptar' o 'rechazar'
router.get('/my-trades', getUserTrades);

export default router;