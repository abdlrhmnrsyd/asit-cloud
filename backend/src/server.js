const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { db } = require("./config/firebase");
const { errorHandler } = require("./middleware/error.middleware");

// Import routes
const authRoutes = require("./routes/auth.routes");
const folderRoutes = require("./routes/folder.routes");
const fileRoutes = require("./routes/file.routes");

const app = express();

// Security & Parsing Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Asit Cloud API",
    version: "1.0.0",
    message: "Asit Cloud Backend is running 🚀",
  });
});

// System Health Check
app.get("/api/health", async (req, res) => {
  try {
    await db.collection("system").doc("health").set({
      status: "ok",
      message: "Firebase connected successfully",
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      status: "ok",
      firebase: "connected",
      storageEngine: "telegram-bot-api",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Firebase Health Check Error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      firebase: "disconnected",
      error: error.message,
    });
  }
});

// Mount Feature Routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Asit Cloud Server running on port ${PORT}`);
});