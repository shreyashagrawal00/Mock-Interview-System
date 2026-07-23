require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const rolesRoute = require("./routes/roles");
const sessionRoute = require("./routes/session");

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL;
app.use(
  cors({
    origin: allowedOrigins ? allowedOrigins.split(",") : "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mock-interview-backend" });
});

app.use("/api/roles", rolesRoute);
app.use("/api/session", sessionRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
});
