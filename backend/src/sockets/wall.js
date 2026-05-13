const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

/**
 * Inicializa el muro de mensajes en tiempo real sobre una instancia de Socket.io.
 * Cada evento tiene su propia sala: "event:{eventId}"
 *
 * Flujo:
 *  1. El cliente conecta enviando el JWT en el handshake (auth.token)
 *  2. El middleware de Socket verifica el token → guarda socket.user
 *  3. El cliente emite "joinEvent" con { eventId }
 *     - Se comprueba que existe el evento
 *     - Se comprueba que el usuario es creador o inscrito
 *     - Se une a la sala y recibe el historial de mensajes
 *  4. El cliente emite "sendMessage" con { eventId, content }
 *     - Se persiste en DB
 *     - Se emite "newMessage" a todos en la sala
 *  5. El cliente emite "leaveEvent" con { eventId } para salir de la sala
 */

module.exports = (io) => {
  // ── Middleware de autenticación Socket.io ──────────────────────────────────
  io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("Token no proporcionado"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Token no válido"));
  }
});

  // ── Conexión ───────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
  if (!socket.user) {
    socket.disconnect();
    return;
  }

    // ── joinEvent ────────────────────────────────────────────────────────────
    socket.on("joinEvent", async ({ eventId }) => {
      try {
        eventId = Number(eventId);

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
          return socket.emit("wallError", { error: "Evento no encontrado" });
        }

        const userId = socket.user.id;
        const isCreator = event.creatorId === userId;

        // Solo el creador o inscritos pueden entrar al muro
        if (!isCreator) {
          const enrollment = await prisma.enrollment.findUnique({
            where: { userId_eventId: { userId, eventId } },
          });

          if (!enrollment) {
            return socket.emit("wallError", {
              error: "Debes estar inscrito en el evento para acceder al muro",
            });
          }
        }

        const room = `event:${eventId}`;
        socket.join(room);

        // Enviar historial de mensajes al cliente que acaba de entrar
        const history = await prisma.message.findMany({
          where: { eventId },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
          take: 50, // últimos 50 mensajes
        });

        socket.emit("messageHistory", history);
      } catch (error) {
        console.error("[WS] joinEvent error:", error);
        socket.emit("wallError", { error: "Error al unirse al muro" });
      }
    });

    // ── sendMessage ──────────────────────────────────────────────────────────
    socket.on("sendMessage", async ({ eventId, content }) => {
      try {
        eventId = Number(eventId);
        const userId = socket.user.id;

        if (!content || !content.trim()) {
          return socket.emit("wallError", {
            error: "El mensaje no puede estar vacío",
          });
        }

        if (content.length > 500) {
          return socket.emit("wallError", {
            error: "El mensaje no puede superar los 500 caracteres",
          });
        }

        // Verificar que el socket está en la sala (ya pasó el guard de joinEvent)
        const room = `event:${eventId}`;
        if (!socket.rooms.has(room)) {
          return socket.emit("wallError", { error: "No estás en este muro" });
        }

        const message = await prisma.message.create({
          data: { content: content.trim(), userId, eventId },
          include: { user: { select: { id: true, name: true } } },
        });

        // Emitir a todos en la sala (incluido el emisor)
        io.to(room).emit("newMessage", message);
      } catch (error) {
        console.error("[WS] sendMessage error:", error);
        socket.emit("wallError", { error: "Error al enviar el mensaje" });
      }
    });

    // ── leaveEvent ───────────────────────────────────────────────────────────
    socket.on("leaveEvent", ({ eventId }) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on("disconnect", () => {});
  });
};
