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
exports.sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"Portal de Eventos" <${process.env.SMTP_USER}>`,
    to,
    subject: "Tu código de verificación",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;text-align:center;">
        <h2>Bienvenido al Portal de Eventos</h2>
        <p>Introduce el siguiente código numérico para verificar tu cuenta:</p>
        
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#fbbf24;background:#1c1917;padding:16px;border-radius:8px;display:inline-block;margin:16px 0;">
          ${code}
        </div>
        
        <p style="color:#888;font-size:12px;margin-top:24px">
          Si no creaste esta cuenta, ignora este mensaje.
        </p>
      </div>
    `,
  });
};