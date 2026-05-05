const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    
    // El ID del creador viene del token (req.user fue inyectado por el middleware)
    const creatorId = req.user.id;

    // Validación básica
    if (!title || !date || !location) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date), // Nos aseguramos de que sea formato Date
        location,
        creatorId: creatorId,
      },
    });

    res.status(201).json({
      message: "Evento creado con éxito",
      event: newEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
};

// Función para listar todos los eventos (Pública)
exports.getAll = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: { name: true, email: true } // Traemos info básica del creador
        }
      },
      orderBy: { date: 'asc' } // Ordenados por fecha próxima
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};