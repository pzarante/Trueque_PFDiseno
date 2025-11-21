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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.emailVerificado) {
      return res.status(401).json({ error: 'Debes verificar tu email primero' });
    }

    if (!user.activo) {
      return res.status(401).json({ error: 'Tu cuenta está desactivada' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        ciudad: user.ciudad
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.emailVerificado) {
      return res.json({ message: 'Email ya verificado' });
    }

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        emailVerificado: true,
        activo: true,
        tokenVerificacion: null
      }
    });

    res.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await prisma.usuario.update({
      where: { id: user.id },
      data: { tokenReset: resetToken }
    });

    res.json({ message: 'Si el email existe, se envió un enlace de recuperación' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar recuperación de contraseña' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!user || user.tokenReset !== token) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        tokenReset: null
      }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
};
