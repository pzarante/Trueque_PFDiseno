import prisma from '../config/database.js';

export const createProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { nombre, categoria, imagenes, condicionesTrueque, comentarioNLP, ubicacion } = req.body;

    // Validaciones básicas
    if (!nombre || !categoria || !comentarioNLP || !condicionesTrueque || !ubicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (imagenes && imagenes.length > 3) {
      return res.status(400).json({ error: 'Máximo 3 imágenes permitidas' });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        categoria,
        imagenes,
        condicionesTrueque,
        comentarioNLP,
        ubicacion,
        oferenteId: userId,
        estado: 'borrador'
      }
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const data = req.body;

    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta oferta' });
    }

    const updated = await prisma.producto.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la oferta' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta oferta' });
    }

    await prisma.producto.delete({ where: { id } });
    res.json({ message: 'Oferta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la oferta' });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { estado } = req.body;

    if (!['borrador', 'publicada', 'pausada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.oferenteId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de esta oferta' });
    }

    const updated = await prisma.producto.update({
      where: { id },
      data: { estado }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estado' });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    const userId = req.userId;
    const { estado, categoria } = req.query;

    const where = { oferenteId: userId };
    
    if (estado) where.estado = estado;
    if (categoria) where.categoria = categoria;

    const productos = await prisma.producto.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' }
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { categoria, estado, ubicacion } = req.query;
    
    const where = { estado: 'publicada' };
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;
    if (ubicacion) where.ubicacion = { contains: ubicacion, mode: 'insensitive' };

    const productos = await prisma.producto.findMany({
      where,
      include: {
        oferente: {
          select: { nombre: true, ciudad: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};