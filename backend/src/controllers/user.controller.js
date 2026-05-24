const prisma  = require("../config/prisma");
const bcrypt  = require("bcrypt");
const parseId = require("../utils/parseId");
const { sendAccountDeleted } = require("../services/email.service");
const { PASSWORD_REGEX } = require("../utils/validation");

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { organizedEvents: true, enrollments: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const data = {};

    if (name) data.name = name;

    // Si quiere cambiar contraseña, verificar la actual primero
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Debes proporcionar tu contraseña actual para cambiarla" });
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo" });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ error: "La contraseña actual no es correcta" });
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ message: "Perfil actualizado", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { creatorId: req.user.id },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { date: "asc" },
    });
    res.json({ total: events.length, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tus eventos" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { organizedEvents: true, enrollments: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ total: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const targetId = parseId(req.params.id);
    if (!targetId) return res.status(400).json({ error: "ID no válido" });
    if (targetId === req.user.id) return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    // Los eventos del usuario no tienen onDelete:Cascade en el schema, hay que borrarlos
    // antes. Al borrar cada evento, sus inscripciones y mensajes sí tienen Cascade.
    await prisma.event.deleteMany({ where: { creatorId: targetId } });
    await prisma.user.delete({ where: { id: targetId } });
    res.json({ message: "Usuario eliminado correctamente" });

    // Notificar al usuario eliminado (fire-and-forget)
    sendAccountDeleted(user.email, user.name).catch(console.error);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const targetId = parseId(req.params.id);
    if (!targetId) return res.status(400).json({ error: "ID no válido" });
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) return res.status(400).json({ error: "Rol no válido" });
    if (targetId === req.user.id) return res.status(400).json({ error: "No puedes cambiar tu propio rol" });
    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ message: "Rol actualizado", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

// ── GET /users/:id/public  →  Público ────────────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  try {
    const targetId = parseId(req.params.id);
    if (!targetId) return res.status(400).json({ error: "ID no válido" });

    const [user, events, ratingAgg, ratings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.event.findMany({
        where: { creatorId: targetId },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.rating.aggregate({
        where: { creatorId: targetId },
        _avg:   { score: true },
        _count: { score: true },
      }),
      prisma.rating.findMany({
        where: { creatorId: targetId },
        include: {
          rater: { select: { id: true, name: true } },
          event: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      user,
      events,
      ratingSummary: {
        average: ratingAgg._avg.score ? Math.round(ratingAgg._avg.score * 10) / 10 : null,
        total:   ratingAgg._count.score,
      },
      ratings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};