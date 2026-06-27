const cron = require("node-cron");
const prisma = require("../config/prisma");

function startCleanupJob() {
  // Ejecutar cada día a las 03:00
  cron.schedule("0 3 * * *", async () => {
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Los eventos NO se eliminan — son datos históricos necesarios para valoraciones y perfiles
      const { count: usersDeleted } = await prisma.user.deleteMany({
        where: {
          emailVerified: false,
          createdAt: { lt: cutoff24h },
        },
      });

      if (usersDeleted > 0) {
        console.log(
          `[CRON] Usuarios sin verificar eliminados: ${usersDeleted}`,
        );
      }
    } catch (error) {
      console.error("[CRON] Error en limpieza:", error);
    }
  });

  console.log("[CRON] Job de limpieza iniciado (diario a las 03:00)");
}

module.exports = startCleanupJob;
