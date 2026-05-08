/**
 * Middleware requireAdmin
 * Debe usarse SIEMPRE después del middleware auth, nunca solo.
 * auth popula req.user → requireAdmin comprueba el rol.
 *
 * Uso en rutas:
 *   router.get("/users", auth, requireAdmin, userController.getAllUsers);
 */
module.exports = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Acceso restringido a administradores" });
  }
  next();
};
