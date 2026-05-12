const prisma = require("../config/prisma");

// ─────────────────────────────────────────────
// POST /events/:id/enroll  →  Privado
// ─────────────────────────────────────────────
exports.enroll = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId  = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (event.creatorId === userId) {
      return res.status(400).json({ error: "No puedes inscribirte en tu propio evento" });
    }

    // Comprobar límite de asistentes
    if (event.maxAttendees !== null && event._count.enrollments >= event.maxAttendees) {
      return res.status(400).json({ error: "El evento ha alcanzado el límite de asistentes" });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, eventId },
    });

    res.status(201).json({ message: "Inscripción realizada con éxito", enrollment });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ya estás inscrito en este evento" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al inscribirse en el evento" });
  }
};

// ─────────────────────────────────────────────
// DELETE /events/:id/enroll  →  Privado
// ─────────────────────────────────────────────
exports.unenroll = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId  = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!enrollment) return res.status(404).json({ error: "No estás inscrito en este evento" });

    await prisma.enrollment.delete({
      where: { userId_eventId: { userId, eventId } },
    });

    res.json({ message: "Inscripción cancelada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar la inscripción" });
  }
};

// ─────────────────────────────────────────────
// GET /events/:id/enrollments  →  Solo el creador
// ─────────────────────────────────────────────
exports.getEnrollments = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId  = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Guard: solo el creador puede ver la lista completa
    if (event.creatorId !== userId) {
      return res.status(403).json({ error: "Solo el creador puede ver la lista de inscritos" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({ total: enrollments.length, enrollments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener inscritos" });
  }
};

// ─────────────────────────────────────────────
// GET /users/me/enrollments  →  Privado
// ─────────────────────────────────────────────
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            creator: { select: { id: true, name: true, email: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
    });

    res.json({ total: enrollments.length, enrollments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tus inscripciones" });
  }
};