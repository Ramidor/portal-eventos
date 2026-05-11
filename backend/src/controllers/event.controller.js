const prisma = require("../config/prisma");

const VALID_CATEGORIES = ["MUSICA", "DEPORTE", "ARTE", "TECNOLOGIA", "GASTRONOMIA", "EDUCACION", "NEGOCIOS", "OTRO"];

// ─────────────────────────────────────────────
// GET /events  →  Público
// Soporta filtros: ?category=MUSICA&location=Madrid&lat=37.3&lng=-5.9&radius=50
// ─────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { category, location } = req.query;

    const where = {
      date: { gte: new Date() }, // Solo eventos futuros
    };

    if (category && VALID_CATEGORIES.includes(category)) {
      where.category = category;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    const events = await prisma.event.findMany({
      where,
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
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el evento" });
  }
};

// ─────────────────────────────────────────────
// POST /events  →  Privado
// ─────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, description, date, location, latitude, longitude, image, category } = req.body;
    const creatorId = req.user.id;

    if (!title || !date || !location) {
      return res.status(400).json({ error: "Faltan campos obligatorios: title, date, location" });
    }

    // Validar que la fecha no sea pasada
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: "La fecha del evento debe ser futura" });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        location,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        image: image ?? null,
        category: category || "OTRO",
        creatorId,
      },
    });

    res.status(201).json({ message: "Evento creado con éxito", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
};

// ─────────────────────────────────────────────
// PUT /events/:id  →  Privado (solo creador)
// ─────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, latitude, longitude, image, category } = req.body;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    if (event.creatorId !== userId) return res.status(403).json({ error: "No tienes permiso para editar este evento" });

    // Validar fecha si se está actualizando
    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        return res.status(400).json({ error: "La fecha del evento debe ser futura" });
      }
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(location && { location }),
        ...(latitude !== undefined && { latitude: latitude ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? Number(longitude) : null }),
        ...(image !== undefined && { image }),
        ...(category && { category }),
      },
    });

    res.json({ message: "Evento actualizado", event: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

// ─────────────────────────────────────────────
// DELETE /events/:id  →  Privado (solo creador)
// ─────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    if (event.creatorId !== userId) return res.status(403).json({ error: "No tienes permiso para eliminar este evento" });

    await prisma.event.delete({ where: { id: Number(id) } });
    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
};