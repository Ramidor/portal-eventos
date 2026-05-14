const prisma  = require("../config/prisma");
const parseId = require("../utils/parseId");

// ── POST /events/:id/ratings ──────────────────────────────────────────────────
exports.submitRating = async (req, res) => {
  try {
    const eventId = parseId(req.params.id);
    if (!eventId) return res.status(400).json({ error: "ID no válido" });

    const raterId = req.user.id;
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5 || !Number.isInteger(Number(score))) {
      return res.status(400).json({ error: "La puntuación debe ser un entero entre 1 y 5" });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (new Date() <= event.date) {
      return res.status(400).json({ error: "Solo puedes valorar eventos que ya han terminado" });
    }
    if (event.creatorId === raterId) {
      return res.status(400).json({ error: "No puedes valorar tu propio evento" });
    }

    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_eventId: { userId: raterId, eventId } },
    });
    if (!enrolled) {
      return res.status(403).json({ error: "Solo los asistentes inscritos pueden valorar" });
    }

    const rating = await prisma.rating.upsert({
      where: { raterId_eventId: { raterId, eventId } },
      create: { score: Number(score), comment: comment?.trim() || null, raterId, creatorId: event.creatorId, eventId },
      update: { score: Number(score), comment: comment?.trim() || null },
    });

    res.status(201).json({ message: "Valoración guardada", rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la valoración" });
  }
};

// ── GET /events/:id/ratings ───────────────────────────────────────────────────
exports.getEventRatings = async (req, res) => {
  try {
    const eventId = parseId(req.params.id);
    if (!eventId) return res.status(400).json({ error: "ID no válido" });

    const ratings = await prisma.rating.findMany({
      where: { eventId },
      include: { rater: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

    res.json({ total: ratings.length, average: avg ? Math.round(avg * 10) / 10 : null, ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener valoraciones" });
  }
};

// ── GET /events/:id/ratings/me ────────────────────────────────────────────────
exports.getMyRating = async (req, res) => {
  try {
    const eventId = parseId(req.params.id);
    if (!eventId) return res.status(400).json({ error: "ID no válido" });

    const raterId = req.user.id;
    const rating  = await prisma.rating.findUnique({
      where: { raterId_eventId: { raterId, eventId } },
    });
    res.json({ rating: rating || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener valoración" });
  }
};

// ── GET /users/me/rating-summary ──────────────────────────────────────────────
exports.getMyRatingSummary = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const result = await prisma.rating.aggregate({
      where: { creatorId },
      _avg:   { score: true },
      _count: { score: true },
    });
    res.json({
      average: result._avg.score ? Math.round(result._avg.score * 10) / 10 : null,
      total:   result._count.score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen de valoraciones" });
  }
};
