import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, city } = req.body;

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const user = await prisma.usuario.create({
      data: {
        nombre: name,
        email,
        password: hashedPassword,
        ciudad: city,
        tokenVerificacion: verificationToken,
        activo: false
      }
    });

    res.status(201).json({
      message: 'Usuario creado. Verifica tu email para activar tu cuenta',
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
