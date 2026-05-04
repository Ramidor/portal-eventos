const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
    req.user = verified; // Guardamos los datos del usuario en la petición
    next();
  } catch (error) {
    res.status(400).json({ error: "Token no válido" });
  }
};