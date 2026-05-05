const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const authRoutes = require("./src/routes/auth.routes");
const eventRoutes = require("./src/routes/event.routes");
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});