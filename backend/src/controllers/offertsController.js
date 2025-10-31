import prisma from "../config/database.js";

export const createOffer = async (req, res) => {
  try {
    const userId = req.userId; 
    const { titulo, categoria, imagenes, condiciones, comentario, ubicacion } = req.body;

    if (!titulo || !categoria || !imagenes || !comentario || !ubicaciones) {
      return res.status(400).json({ error: "Campos obligatorios incompletos" });
    }

    if (imagenes.length > 3) {
      return res.status(400).json({ error: "Máximo 3 imágenes permitidas" });
    }

    const oferta = await prisma.oferta.create({
      data: {
        titulo,
        categoria,
        imagenes,
        condiciones,
        comentario,
        ubicacion,
        creadorId: userId,
      },
    });

    res.status(201).json(oferta);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la oferta" });
  }
};

export const updateOffer = async (req, res) => {
    try {
      const userId = req.userId;
      const offerId = parseInt(req.params.id);
      const { titulo, categoria, imagenes, condiciones, comentario, ubicacion } = req.body;
  
      const oferta = await prisma.oferta.findUnique({ where: { id: offerId } });
  
      if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });
      if (oferta.creadorId !== userId) return res.status(403).json({ error: "No puedes editar esta oferta" });
  
      const updatedOffer = await prisma.oferta.update({
        where: { id: offerId },
        data: {
          ...(titulo && { titulo }),
          ...(categoria && { categoria }),
          ...(imagenes && { imagenes }),
          ...(condiciones && { condiciones }),
          ...(comentario && { comentario }),
          ...(ubicacion && { ubicacion }),
        },
      });
  
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la oferta" });
    }
  };

export const deleteOffer = async (req, res) => {
  try {
    const userId = req.userId;
    const offerId = parseInt(req.params.id);

    const oferta = await prisma.oferta.findUnique({ where: { id: offerId } });

    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });
    if (oferta.creadorId !== userId) return res.status(403).json({ error: "No puedes eliminar esta oferta" });

    await prisma.oferta.delete({ where: { id: offerId } });

    res.json({ message: "Oferta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la oferta" });
  }
};

