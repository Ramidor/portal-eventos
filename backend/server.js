const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Socket.io necesita el server HTTP nativo

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// ── Middlewares REST ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/", (req, res) => res.send("API funcionando 🚀"));

// ── Rutas REST ─────────────────────────────────────────────────────────────────
const authRoutes = require("./src/routes/auth.routes");
const eventRoutes = require("./src/routes/event.routes");
const userRoutes = require("./src/routes/user.routes");
const messageRoutes = require("./src/routes/message.routes");

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/users", userRoutes);
app.use("/events/:id/messages", messageRoutes); // REST: historial paginado

// ── WebSocket: Muro en tiempo real ─────────────────────────────────────────────
const wall = require("./src/sockets/wall");
wall(io);

// ── Arranque ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
