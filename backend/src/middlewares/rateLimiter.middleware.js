const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: "Demasiados intentos. Espera 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
