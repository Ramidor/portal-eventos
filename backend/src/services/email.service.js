const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout:   5000,
  socketTimeout:     10000,
  family:            4,
});

const FROM = `"Portal de Eventos" <${process.env.SMTP_USER}>`;

const base = (content) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#1c1917;color:#e7e5e4;padding:32px;border-radius:16px">
    <p style="color:#fbbf24;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px">Portal de Eventos</p>
    ${content}
    <p style="color:#57534e;font-size:11px;margin-top:32px">Si no esperabas este mensaje, puedes ignorarlo.</p>
  </div>
`;

// ── Verificación de cuenta ────────────────────────────────────────────────────
exports.sendVerificationCode = async (to, code) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: "Tu código de verificación",
    html: base(`
      <h2 style="margin:0 0 12px">Verifica tu cuenta</h2>
      <p style="color:#a8a29e">Introduce este código para activar tu cuenta:</p>
      <div style="font-size:40px;font-weight:bold;letter-spacing:12px;
                  background:#292524;color:#fbbf24;padding:24px;
                  border-radius:12px;text-align:center;margin:24px 0">
        ${code}
      </div>
      <p style="color:#78716c;font-size:12px">Expira en <strong>15 minutos</strong>.</p>
    `),
  });
};

// ── Recuperación de contraseña ────────────────────────────────────────────────
exports.sendPasswordReset = async (to, resetUrl) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: "Restablecer contraseña",
    html: base(`
      <h2 style="margin:0 0 12px">Restablece tu contraseña</h2>
      <p style="color:#a8a29e">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva:</p>
      <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#fbbf24;color:#1c1917;
               font-weight:bold;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Restablecer contraseña
      </a>
      <p style="color:#78716c;font-size:12px">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, ignora este mensaje.</p>
    `),
  });
};

// ── Cuenta eliminada por admin ────────────────────────────────────────────────
exports.sendAccountDeleted = async (to, name) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: "Tu cuenta ha sido eliminada",
    html: base(`
      <h2 style="margin:0 0 12px">Hola, ${name}</h2>
      <p style="color:#a8a29e">Tu cuenta en Portal de Eventos ha sido eliminada por un administrador.</p>
      <p style="color:#a8a29e">Si crees que se trata de un error, contacta con el soporte.</p>
    `),
  });
};

// ── Evento cancelado — al creador (eliminado por admin) ──────────────────────
exports.sendEventCancelledToCreator = async (to, eventTitle) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Tu evento "${eventTitle}" ha sido cancelado`,
    html: base(`
      <h2 style="margin:0 0 12px">Evento cancelado</h2>
      <p style="color:#a8a29e">Tu evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> ha sido eliminado por un administrador.</p>
      <p style="color:#a8a29e">Si crees que se trata de un error, contacta con el soporte.</p>
    `),
  });
};

// ── Evento cancelado — a los inscritos ───────────────────────────────────────
exports.sendEventCancelledToEnrollee = async (to, eventTitle, eventDate) => {
  const dateStr = new Date(eventDate).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  await transporter.sendMail({
    from: FROM, to,
    subject: `Evento cancelado: "${eventTitle}"`,
    html: base(`
      <h2 style="margin:0 0 12px">Un evento al que ibas fue cancelado</h2>
      <p style="color:#a8a29e">El evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> programado para el <strong style="color:#e7e5e4">${dateStr}</strong> ha sido cancelado.</p>
      <p style="color:#a8a29e">Tu inscripción ha sido eliminada automáticamente.</p>
    `),
  });
};

// ── Evento modificado — a los inscritos ──────────────────────────────────────
exports.sendEventModified = async (to, eventTitle, changes) => {
  const changeRows = changes
    .map((c) => `<li style="margin-bottom:8px;color:#a8a29e"><strong style="color:#fbbf24">${c.field}:</strong> ${c.value}</li>`)
    .join("");
  await transporter.sendMail({
    from: FROM, to,
    subject: `Actualización en "${eventTitle}"`,
    html: base(`
      <h2 style="margin:0 0 12px">Un evento al que asistes ha cambiado</h2>
      <p style="color:#a8a29e">El evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> ha sido actualizado:</p>
      <ul style="margin:16px 0;padding-left:20px">${changeRows}</ul>
      <p style="color:#a8a29e">Revisa los detalles actualizados en la plataforma.</p>
    `),
  });
};

// ── Recordatorio día anterior ─────────────────────────────────────────────────
exports.sendEventReminder = async (to, eventTitle, eventDate, location) => {
  const timeStr = new Date(eventDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  await transporter.sendMail({
    from: FROM, to,
    subject: `Mañana: "${eventTitle}"`,
    html: base(`
      <h2 style="margin:0 0 12px">¡Mañana es tu evento! 🎉</h2>
      <p style="color:#a8a29e">Recuerda que mañana tienes:</p>
      <div style="background:#292524;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:#e7e5e4">${eventTitle}</p>
        <p style="margin:0 0 4px;color:#a8a29e;font-family:monospace;font-size:13px">🕐 ${timeStr}</p>
        <p style="margin:0;color:#a8a29e;font-family:monospace;font-size:13px">📍 ${location}</p>
      </div>
      <p style="color:#78716c;font-size:12px">¡Nos vemos allí!</p>
    `),
  });
};
