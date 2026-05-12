const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../services/email.service");

// Función auxiliar para generar 6 números aleatorios
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: name, email, password" });
    }
    // Validación de seguridad de contraseña (Min 6 caracteres, 1 número, 1 símbolo)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 6 caracteres, un número y un símbolo (!@#$%^&*)",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateOTP(); // Genera un código OTP de 6 dígitos

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, verificationCode },
    });

    // Enviar email de verificación (no bloqueante — si falla, el usuario ya está creado)
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (mailError) {
      console.error("[EMAIL] Error al enviar verificación:", mailError.message);
    }

    res.status(201).json({
      message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }
    console.error(error);
    res.status(500).json({ error: "Error creando usuario" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: email, password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Credenciales incorrectas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Credenciales incorrectas" });

    // Bloquear login si el email no está verificado
    if (!user.emailVerified) {
      return res.status(403).json({
        error:
          "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email y código requeridos" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    if (user.emailVerified)
      return res.status(400).json({ error: "El email ya está verificado" });
    if (user.verificationCode !== code)
      return res.status(400).json({ error: "Código incorrecto" });

    // Código correcto, actualizamos el usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationCode: null },
    });
    // 2. Marcar como verificado y limpiar campos de seguridad
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: true, 
        verificationCode: null
      },
    });

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      message: "Email verificado e inicio de sesión exitoso",
      token,
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: "Error al verificar el email" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return res.json({
        message:
          "Si el email existe y no está verificado, recibirás un nuevo código.",
      });
    }

    const verificationCode = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode },
    });

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: "Código de verificación reenviado." });
  } catch (error) {
    res.status(500).json({ error: "Error al reenviar verificación" });
  }
};
