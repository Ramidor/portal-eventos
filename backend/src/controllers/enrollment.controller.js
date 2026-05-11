const prisma = require("../config/prisma");
const e = require("express");

// ─────────────────────────────────────────────
// POST /events/:id/enroll  →  Privado
// Inscribe al usuario autenticado en el evento
//
exports.enroll = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // El creador no puede inscribirse en su propio evento
    if (event.creatorId === userId) {
      return res
        .status(400)
        .json({ error: "No puedes inscribirte a tu propio evento" });
    }

    // Verificar que el usuario no esté ya inscrito
    const enrollment = await prisma.enrollment.create({
      data: { userId, eventId },
    });

    res
      .status(201)
      .json({ message: "Inscripción realizada con éxito", enrollment });
  } catch (error) {
    // Unique constraint violation → ya estaba inscrito
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Ya estás inscrito en este evento" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al inscribirse en el evento" });
  }
};

// ─────────────────────────────────────────────
// DELETE /events/:id/enroll  →  Privado
// Cancela la inscripción del usuario autenticado
// ─────────────────────────────────────────────
exports.unenroll = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!enrollment) {
      return res
        .status(404)
        .json({ error: "No estás inscrito en este evento" });
    }

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
// GET /events/:id/enrollments  →  Público
// Lista los inscritos en un evento
// ─────────────────────────────────────────────
exports.getEnrollments = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
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
// Lista los eventos a los que está inscrito el usuario autenticado
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
