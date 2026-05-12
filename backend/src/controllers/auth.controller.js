const prisma  = require("../config/prisma");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { sendVerificationEmail } = require("../services/email.service");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios: name, email, password" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const hashedPassword    = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, verificationToken },
    });

    // Enviar email de verificación (no bloqueante — si falla, el usuario ya está creado)
    try {
      await sendVerificationEmail(email, verificationToken);
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
      return res.status(400).json({ error: "Faltan campos obligatorios: email, password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Credenciales incorrectas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Credenciales incorrectas" });

    // Bloquear login si el email no está verificado
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "Token no proporcionado" });

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Token no válido o ya utilizado" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    // Redirigir al login con mensaje de éxito
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar el email" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Respuesta genérica para no revelar si el email existe
    if (!user || user.emailVerified) {
      return res.json({ message: "Si el email existe y no está verificado, recibirás un nuevo enlace." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "Email de verificación reenviado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reenviar verificación" });
  }
};