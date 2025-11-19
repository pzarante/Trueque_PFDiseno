import express from 'express';
import { 
  proponerTrueque, 
  getTruequesUsuario, 
  confirmarTruequeOferente, 
  confirmarTruequeDestinatario, 
  rechazarTrueque 
} from '../controllers/truequesController.js';

const router = express.Router();

// Proponer un nuevo trueque
router.post('/proponer', proponerTrueque);

// Obtener todos los trueques del usuario (como oferente o destinatario)
router.get('/mis-trueques', getTruequesUsuario);

// Oferente confirma el trueque (primera confirmación)
router.put('/confirmar-oferente', confirmarTruequeOferente);

// Destinatario confirma el trueque (segunda confirmación - bilateral completa)
router.put('/confirmar-destinatario', confirmarTruequeDestinatario);

// Rechazar trueque (cualquiera de las partes)
router.put('/rechazar', rechazarTrueque);

// Registro final de cierre (después de confirmación bilateral)
router.put('/registrar-cierre', registrarCierreTrueque);

// Obtener trueques completados (historial)
router.get('/completados', getTruequesCompletados);

export default router;