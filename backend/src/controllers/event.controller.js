const prisma   = require("../config/prisma");
const parseId  = require("../utils/parseId");
const {
  sendEventCancelledToEnrollee,
  sendEventCancelledToCreator,
  sendEventModified,
} = require("../services/email.service");

const VALID_CATEGORIES = ["MUSICA","DEPORTE","ARTE","TECNOLOGIA","GASTRONOMIA","EDUCACION","NEGOCIOS","OTRO"];

// Obtiene los emails de todos los inscritos en un evento
async function getEnrolleeEmails(eventId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { eventId },
    include: { user: { select: { email: true } } },
  });
  return enrollments.map((e) => e.user.email);
}

exports.getAll = async (req, res) => {
  try {
    const { category, location, search } = req.query;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const where = { date: { gte: new Date() } };
    if (category && VALID_CATEGORIES.includes(category)) where.category = category;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title:    { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { date: "asc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({ total, page, limit, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

exports.adminGetAll = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { date: "desc" },
    });
    res.json({ total: events.length, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID no válido" });
    const event = await prisma.event.findUnique({
      where: { id },
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

exports.create = async (req, res) => {
  try {
    const { title, description, date, location, latitude, longitude, image, category, maxAttendees } = req.body;
    const creatorId = req.user.id;

    if (!title || !date || !location) {
      return res.status(400).json({ error: "Faltan campos obligatorios: title, date, location" });
    }

    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: "La fecha del evento debe ser futura" });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    if (maxAttendees !== undefined && maxAttendees !== null && Number(maxAttendees) < 1) {
      return res.status(400).json({ error: "El límite de asistentes debe ser al menos 1" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title, description,
        date: eventDate,
        location,
        latitude:     latitude  != null && latitude  !== "" ? Number(latitude)  : null,
        longitude:    longitude != null && longitude !== "" ? Number(longitude) : null,
        image:        image        ?? null,
        category:     category     || "OTRO",
        maxAttendees: maxAttendees != null && maxAttendees !== "" ? Number(maxAttendees) : null,
        creatorId,
      },
    });

    res.status(201).json({ message: "Evento creado con éxito", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID no válido" });
    const { title, description, date, location, latitude, longitude, image, category, maxAttendees } = req.body;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!event)                    return res.status(404).json({ error: "Evento no encontrado" });
    if (event.creatorId !== userId) return res.status(403).json({ error: "No tienes permiso para editar este evento" });

    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) return res.status(400).json({ error: "La fecha del evento debe ser futura" });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    // No permitir reducir el aforo por debajo de los inscritos actuales
    if (maxAttendees != null && maxAttendees !== "") {
      const newMax = Number(maxAttendees);
      if (newMax < 1) {
        return res.status(400).json({ error: "El límite de asistentes debe ser al menos 1" });
      }
      if (newMax < event._count.enrollments) {
        return res.status(400).json({
          error: `No puedes reducir el aforo por debajo de los inscritos actuales (${event._count.enrollments})`,
        });
      }
    }

    // Detectar cambios en campos importantes para notificar a inscritos
    const changes = [];
    if (title    && title    !== event.title)    changes.push({ field: "Título",    value: title });
    if (date     && new Date(date).getTime() !== event.date.getTime())
      changes.push({ field: "Fecha",  value: new Date(date).toLocaleString("es-ES") });
    if (location && location !== event.location) changes.push({ field: "Lugar",     value: location });

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title       && { title }),
        ...(description !== undefined && { description }),
        ...(date        && { date: new Date(date) }),
        ...(location    && { location }),
        ...(latitude    !== undefined && { latitude:  latitude  != null && latitude  !== "" ? Number(latitude)  : null }),
        ...(longitude   !== undefined && { longitude: longitude != null && longitude !== "" ? Number(longitude) : null }),
        ...(image       !== undefined && { image }),
        ...(category    && { category }),
        ...(maxAttendees !== undefined && { maxAttendees: maxAttendees != null && maxAttendees !== "" ? Number(maxAttendees) : null }),
      },
    });

    res.json({ message: "Evento actualizado", event: updated });

    // Notificar a inscritos si hubo cambios relevantes (fire-and-forget)
    if (changes.length > 0 && event._count.enrollments > 0) {
      getEnrolleeEmails(id).then((emails) => {
        emails.forEach((email) =>
          sendEventModified(email, updated.title, changes).catch(console.error)
        );
      }).catch(console.error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id      = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID no válido" });
    const userId  = req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    const event   = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { email: true } },
        _count:  { select: { enrollments: true } },
      },
    });
    if (!event)                                 return res.status(404).json({ error: "Evento no encontrado" });
    if (!isAdmin && event.creatorId !== userId) return res.status(403).json({ error: "No tienes permiso para eliminar este evento" });

    // Recopilar emails antes de borrar
    const enrolleeEmails = event._count.enrollments > 0
      ? await getEnrolleeEmails(id)
      : [];
    const isAdminDelete = isAdmin && event.creatorId !== userId;

    await prisma.event.delete({ where: { id } });
    res.json({ message: "Evento eliminado correctamente" });

    // Notificaciones (fire-and-forget)
    enrolleeEmails.forEach((email) =>
      sendEventCancelledToEnrollee(email, event.title, event.date).catch(console.error)
    );
    if (isAdminDelete) {
      sendEventCancelledToCreator(event.creator.email, event.title).catch(console.error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
};