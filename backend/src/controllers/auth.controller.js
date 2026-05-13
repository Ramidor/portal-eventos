const prisma  = require("../config/prisma");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const { sendVerificationCode } = require("../services/email.service");

// Regex de validación
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(.{8,})$/;

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

// ─────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "El formato del email no es válido" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo (!@#$%...)",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code           = generateOTP();
    const expiry         = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Upsert: si el email ya existe y no está verificado, regenera el código
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.emailVerified) {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }

    if (existing) {
      // Reenviar código al usuario que no verificó
      await prisma.user.update({
        where: { email },
        data: { verificationCode: code, verificationCodeExpiry: expiry },
      });
    } else {
      await prisma.user.create({
        data: { name, email, password: hashedPassword, verificationCode: code, verificationCodeExpiry: expiry },
      });
    }

    try {
      await sendVerificationCode(email, code);
    } catch (mailError) {
      console.error("[EMAIL] Error al enviar OTP:", mailError.message);
    }

    res.status(201).json({ message: "Código enviado. Revisa tu email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
};

// ─────────────────────────────────────────────
// POST /auth/verify-email
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email y código son obligatorios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    if (user.emailVerified) return res.status(400).json({ error: "El email ya está verificado" });

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo.", code: "CODE_EXPIRED" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationCode: null, verificationCodeExpiry: null },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Email verificado correctamente",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar el código" });
  }
};

// ─────────────────────────────────────────────
// POST /auth/resend-verification
// ─────────────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Respuesta genérica para no revelar si el email existe
    if (!user || user.emailVerified) {
      return res.json({ message: "Si el email existe y no está verificado, recibirás un nuevo código." });
    }

    const code   = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code, verificationCodeExpiry: expiry },
    });

    await sendVerificationCode(email, code);

    res.json({ message: "Nuevo código enviado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reenviar el código" });
  }
};

// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Credenciales incorrectas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Credenciales incorrectas" });

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Debes verificar tu email antes de iniciar sesión.",
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