const cron = require("node-cron");
const prisma = require("../config/prisma");
const { sendEventReminder } = require("../services/email.service");

function startRemindersJob() {
  // Ejecutar cada día a las 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    try {
      const events = await prisma.event.findMany({
        where: { date: { gte: in24h, lte: in48h } },
        include: {
          enrollments: { include: { user: { select: { email: true } } } },
        },
      });

      let sent = 0;
      for (const event of events) {
        for (const enrollment of event.enrollments) {
          try {
            await sendEventReminder(
              enrollment.user.email,
              event.title,
              event.date,
              event.location,
            );
            sent++;
          } catch (err) {
            console.error(
              `[REMINDERS] Error enviando a ${enrollment.user.email}:`,
              err.message,
            );
          }
        }
      }

      console.log(
        `[REMINDERS] Recordatorios enviados: ${sent} (${events.length} eventos mañana)`,
      );
    } catch (error) {
      console.error("[REMINDERS] Error en job de recordatorios:", error);
    }
  });

  console.log("[REMINDERS] Job de recordatorios iniciado (diario a las 09:00)");
}

module.exports = startRemindersJob;
