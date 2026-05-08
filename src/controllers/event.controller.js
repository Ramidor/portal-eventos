const prisma = require("../config/prisma");

// ─────────────────────────────────────────────
// GET /events  →  Público
// ─────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

// ─────────────────────────────────────────────
// GET /events/:id  →  Público
// ─────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el evento" });
  }
};

// ─────────────────────────────────────────────
// POST /events  →  Privado (cualquier usuario logueado)
// ─────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, description, date, location, image } = req.body;
    const creatorId = req.user.id;

    if (!title || !date || !location) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: title, date, location" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        image: image ?? null,
        creatorId,
      },
    });

    res
      .status(201)
      .json({ message: "Evento creado con éxito", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
};

// ─────────────────────────────────────────────
// PUT /events/:id  →  Privado (solo el creador)
// ─────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, image } = req.body;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Guard: solo el creador puede editar
    if (event.creatorId !== userId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar este evento" });
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(location && { location }),
        ...(image !== undefined && { image }),
      },
    });

    res.json({ message: "Evento actualizado", event: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

// ─────────────────────────────────────────────
// DELETE /events/:id  →  Privado (solo el creador)
// ─────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Guard: solo el creador puede eliminar
    if (event.creatorId !== userId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este evento" });
    }

    await prisma.event.delete({ where: { id: Number(id) } });

    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
};
