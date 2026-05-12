const cron = require("node-cron");
const prisma = require("../config/prisma");

/**
 * Cron job: se ejecuta cada día a las 03:00
 * Elimina eventos cuya fecha terminó hace más de 24 horas
 */
function startCleanupJob() {
  cron.schedule("0 3 * * *", async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const { count } = await prisma.event.deleteMany({
        where: { date: { lt: cutoff } },
      });
      console.log(
        `[CRON] Limpieza completada: ${count} evento(s) eliminado(s)`,
      );
    } catch (error) {
      console.error("[CRON] Error en limpieza de eventos:", error);
    }
    await prisma.user.deleteMany({
      where: {
        emailVerified: false,
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
  });

  console.log("[CRON] Job de limpieza iniciado (diario a las 03:00)");
}

module.exports = startCleanupJob;
