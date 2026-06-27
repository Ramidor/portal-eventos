const prisma = require("../config/prisma");
const parseId = require("../utils/parseId");

exports.getMessages = async (req, res) => {
  try {
    const eventId = parseId(req.params.id);
    if (!eventId) return res.status(400).json({ error: "ID no válido" });
    const userId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    const isCreator = event.creatorId === userId;
    if (!isCreator) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });
      if (!enrollment) {
        return res
          .status(403)
          .json({ error: "Debes estar inscrito para ver el muro" });
      }
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { eventId } }),
    ]);

    res.json({ total, page, limit, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
};
