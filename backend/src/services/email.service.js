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

exports.sendVerificationCode = async (to, code) => {
  await transporter.sendMail({
    from:    `"Portal de Eventos" <${process.env.SMTP_USER}>`,
    to,
    subject: "Tu código de verificación",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Verifica tu cuenta</h2>
        <p>Introduce este código en la aplicación para activar tu cuenta:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:12px;
                    background:#1c1917;color:#fbbf24;padding:24px;
                    border-radius:12px;text-align:center;margin:24px 0">
          ${code}
        </div>
        <p style="color:#888;font-size:12px">
          El código expira en <strong>15 minutos</strong>.<br>
          Si no creaste esta cuenta, ignora este mensaje.
        </p>
      </div>
    `,
  });
};