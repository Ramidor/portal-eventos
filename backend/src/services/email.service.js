const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envía el email de verificación al nuevo usuario
 */
exports.sendVerificationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    `"Portal de Eventos" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verifica tu cuenta",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Bienvenido al Portal de Eventos</h2>
        <p>Haz clic en el botón para verificar tu dirección de email:</p>
        <a href="${url}"
           style="display:inline-block;background:#fbbf24;color:#1c1917;
                  padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Verificar email
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">
          Si no creaste esta cuenta, ignora este mensaje.<br>
          El enlace expira en 24 horas.
        </p>
      </div>
    `,
  });
};