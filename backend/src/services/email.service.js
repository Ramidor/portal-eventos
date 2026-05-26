const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = `Portal de Eventos <onboarding@resend.dev>`;

const base = (content) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#1c1917;color:#e7e5e4;padding:32px;border-radius:16px">
    <p style="color:#fbbf24;font-family:monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px">Portal de Eventos</p>
    ${content}
    <p style="color:#57534e;font-size:11px;margin-top:32px">Si no esperabas este mensaje, puedes ignorarlo.</p>
  </div>
`;

async function send(to, subject, html) {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend: ${error.message}`);
}

// ── Verificación de cuenta ────────────────────────────────────────────────────
exports.sendVerificationCode = (to, code) =>
  send(to, "Tu código de verificación", base(`
    <h2 style="margin:0 0 12px">Verifica tu cuenta</h2>
    <p style="color:#a8a29e">Introduce este código para activar tu cuenta:</p>
    <div style="font-size:40px;font-weight:bold;letter-spacing:12px;
                background:#292524;color:#fbbf24;padding:24px;
                border-radius:12px;text-align:center;margin:24px 0">
      ${code}
    </div>
    <p style="color:#78716c;font-size:12px">Expira en <strong>15 minutos</strong>.</p>
  `));

// ── Recuperación de contraseña ────────────────────────────────────────────────
exports.sendPasswordReset = (to, resetUrl) =>
  send(to, "Restablecer contraseña", base(`
    <h2 style="margin:0 0 12px">Restablece tu contraseña</h2>
    <p style="color:#a8a29e">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva:</p>
    <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#fbbf24;color:#1c1917;
             font-weight:bold;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
      Restablecer contraseña
    </a>
    <p style="color:#78716c;font-size:12px">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, ignora este mensaje.</p>
  `));

// ── Cuenta eliminada por admin ────────────────────────────────────────────────
exports.sendAccountDeleted = (to, name) =>
  send(to, "Tu cuenta ha sido eliminada", base(`
    <h2 style="margin:0 0 12px">Hola, ${name}</h2>
    <p style="color:#a8a29e">Tu cuenta en Portal de Eventos ha sido eliminada por un administrador.</p>
    <p style="color:#a8a29e">Si crees que se trata de un error, contacta con el soporte.</p>
  `));

// ── Evento cancelado — al creador ─────────────────────────────────────────────
exports.sendEventCancelledToCreator = (to, eventTitle) =>
  send(to, `Tu evento "${eventTitle}" ha sido cancelado`, base(`
    <h2 style="margin:0 0 12px">Evento cancelado</h2>
    <p style="color:#a8a29e">Tu evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> ha sido eliminado por un administrador.</p>
    <p style="color:#a8a29e">Si crees que se trata de un error, contacta con el soporte.</p>
  `));

// ── Evento cancelado — a los inscritos ───────────────────────────────────────
exports.sendEventCancelledToEnrollee = (to, eventTitle, eventDate) => {
  const dateStr = new Date(eventDate).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return send(to, `Evento cancelado: "${eventTitle}"`, base(`
    <h2 style="margin:0 0 12px">Un evento al que ibas fue cancelado</h2>
    <p style="color:#a8a29e">El evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> programado para el <strong style="color:#e7e5e4">${dateStr}</strong> ha sido cancelado.</p>
    <p style="color:#a8a29e">Tu inscripción ha sido eliminada automáticamente.</p>
  `));
};

// ── Evento modificado — a los inscritos ──────────────────────────────────────
exports.sendEventModified = (to, eventTitle, changes) => {
  const changeRows = changes
    .map((c) => `<li style="margin-bottom:8px;color:#a8a29e"><strong style="color:#fbbf24">${c.field}:</strong> ${c.value}</li>`)
    .join("");
  return send(to, `Actualización en "${eventTitle}"`, base(`
    <h2 style="margin:0 0 12px">Un evento al que asistes ha cambiado</h2>
    <p style="color:#a8a29e">El evento <strong style="color:#e7e5e4">"${eventTitle}"</strong> ha sido actualizado:</p>
    <ul style="margin:16px 0;padding-left:20px">${changeRows}</ul>
    <p style="color:#a8a29e">Revisa los detalles actualizados en la plataforma.</p>
  `));
};

// ── Recordatorio día anterior ─────────────────────────────────────────────────
exports.sendEventReminder = (to, eventTitle, eventDate, location) => {
  const timeStr = new Date(eventDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return send(to, `Mañana: "${eventTitle}"`, base(`
    <h2 style="margin:0 0 12px">¡Mañana es tu evento!</h2>
    <p style="color:#a8a29e">Recuerda que mañana tienes:</p>
    <div style="background:#292524;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:#e7e5e4">${eventTitle}</p>
      <p style="margin:0 0 4px;color:#a8a29e;font-family:monospace;font-size:13px">🕐 ${timeStr}</p>
      <p style="margin:0;color:#a8a29e;font-family:monospace;font-size:13px">📍 ${location}</p>
    </div>
    <p style="color:#78716c;font-size:12px">¡Nos vemos allí!</p>
  `));
};
