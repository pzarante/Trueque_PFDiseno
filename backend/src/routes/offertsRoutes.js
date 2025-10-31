import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createOffer, updateOffer, deleteOffer } from "../controllers/offerController.js";

const router = express.Router();

router.post("/", authMiddleware, createOffer);        // Crear oferta
router.put("/:id", authMiddleware, updateOffer);      // Editar oferta propia
router.delete("/:id", authMiddleware, deleteOffer);   // Eliminar oferta propia

export default router;
