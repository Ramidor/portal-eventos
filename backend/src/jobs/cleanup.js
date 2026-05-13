const cron  = require("node-cron");
const prisma = require("../config/prisma");

function startCleanupJob() {
  cron.schedule("0 3 * * *", async () => {
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // 1. Eliminar eventos pasados con más de 24h
      const { count: eventsDeleted } = await prisma.event.deleteMany({
        where: { date: { lt: cutoff24h } },
      });

      // 2. Eliminar usuarios no verificados con más de 24h
      const { count: usersDeleted } = await prisma.user.deleteMany({
        where: {
          emailVerified: false,
          createdAt: { lt: cutoff24h },
        },
      });

      console.log(`[CRON] Eventos eliminados: ${eventsDeleted} | Usuarios sin verificar eliminados: ${usersDeleted}`);
    } catch (error) {
      console.error("[CRON] Error en limpieza:", error);
    }
  });

  console.log("[CRON] Job de limpieza iniciado (diario a las 03:00)");
}

module.exports = startCleanupJob;