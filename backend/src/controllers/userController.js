import prisma from '../config/database.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        ciudad: true,
        descripcion: true,
        emailVerificado: true,
        fechaCreacion: true,
        activo: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { nombre, ciudad, descripcion } = req.body;

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(nombre && { nombre }),
        ...(ciudad && { ciudad }),
        ...(descripcion && { descripcion })
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        ciudad: true,
        descripcion: true,
        fechaCreacion: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const getReputation = async (req, res) => {
  try {
    const userId = req.userId;

    const intercambios = await prisma.intercambio.findMany({
      where: {
        OR: [
          { solicitanteId: userId },
          { oferenteId: userId }
        ],
        estado: 'completado'
      }
    });

    const truequesCompletados = intercambios.length;

    const calificaciones = await prisma.calificacion.findMany({
      where: { calificadoId: userId }
    });

    const promedio = calificaciones.length > 0
      ? calificaciones.reduce((sum, cal) => sum + cal.puntaje, 0) / calificaciones.length
      : 0;

    res.json({
      promedio: Number(promedio.toFixed(2)),
      truequesCompletados
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reputación' });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.userId;

    await prisma.usuario.update({
      where: { id: userId },
      data: { activo: false }
    });

    res.json({ message: 'Cuenta desactivada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar cuenta' });
  }
};
