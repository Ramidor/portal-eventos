const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

// ─────────────────────────────────────────────
// GET /users/me  →  Privado
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            organizedEvents: true,
            enrollments: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

// ─────────────────────────────────────────────
// PUT /users/me  →  Privado
// ─────────────────────────────────────────────
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    // Construir solo los campos que llegan
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "La contraseña debe tener al menos 6 caracteres" });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ message: "Perfil actualizado", user: updated });
  } catch (error) {
    // Email duplicado
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ese email ya está en uso" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

// ─────────────────────────────────────────────
// GET /users/me/events  →  Privado
// Eventos organizados por el usuario autenticado
// ─────────────────────────────────────────────
exports.getMyEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { creatorId: req.user.id },
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json({ total: events.length, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tus eventos" });
  }
};

// ─────────────────────────────────────────────
// GET /admin/users  →  Solo ADMIN
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            organizedEvents: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ total: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// ─────────────────────────────────────────────
// DELETE /admin/users/:id  →  Solo ADMIN
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    if (targetId === req.user.id) {
      return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
    }

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await prisma.user.delete({ where: { id: targetId } });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};

// ─────────────────────────────────────────────
// PATCH /admin/users/:id/role  →  Solo ADMIN
// Cambia el rol de un usuario (USER ↔ ADMIN)
// ─────────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Rol no válido. Usa USER o ADMIN" });
    }

    if (targetId === req.user.id) {
      return res.status(400).json({ error: "No puedes cambiar tu propio rol" });
    }

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
