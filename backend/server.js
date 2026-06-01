require("dns").setDefaultResultOrder("ipv4first"); // Railway no soporta IPv6 saliente
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const REQUIRED_ENV = [
  "JWT_SECRET", "DATABASE_URL", "CLIENT_URL",
  "RESEND_API_KEY",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((v) => !process.env[v]);
if (missingEnv.length) {
  console.error(`FATAL: Variables de entorno faltantes: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
const server = http.createServer(app); // Socket.io necesita el server HTTP nativo

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:8081",  // Expo web dev
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origen no permitido"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET", "POST"] },
});

// ── Middlewares REST ───────────────────────────────────────────────────────────
app.set("trust proxy", 1); // Railway usa proxy inverso
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

const { authLimiter } = require("./src/middlewares/rateLimiter.middleware");

app.get("/", (req, res) => res.send("API funcionando 🚀"));

// ── Swagger UI ─────────────────────────────────────────────────────────────────
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Alphavents — API Docs",
}));

// ── Rutas REST ─────────────────────────────────────────────────────────────────
const authRoutes   = require("./src/routes/auth.routes");
const eventRoutes  = require("./src/routes/event.routes");
const userRoutes   = require("./src/routes/user.routes");
const messageRoutes = require("./src/routes/message.routes");
const uploadRoutes = require("./src/routes/upload.routes");

app.use("/auth",    authLimiter, authRoutes);
app.use("/events",  eventRoutes);
app.use("/users",   userRoutes);
app.use("/upload",  uploadRoutes);
app.use("/events/:id/messages", messageRoutes);

// ── WebSocket: Muro en tiempo real ─────────────────────────────────────────────
const wall = require("./src/sockets/wall");
wall(io);

// ── Cron jobs ──────────────────────────────────────────────────────────────────
const startCleanupJob   = require("./src/jobs/cleanup");
const startRemindersJob = require("./src/jobs/reminders");
startCleanupJob();
startRemindersJob();

// ── Arranque ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
