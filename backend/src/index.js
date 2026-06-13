const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

const logger = require("./utils/logger");

// =====================================
// Load Environment Variables
// =====================================

dotenv.config();

// =====================================
// Express App
// =====================================

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// MongoDB Connection
// =====================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("MongoDB connected successfully");
  })
  .catch((err) => {
    logger.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// =====================================
// Middleware
// =====================================

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// =====================================
// Root Endpoint
// =====================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "Meeting Assistant API",
    status: "running",
    version: "1.0.0",
    timestamp: new Date(),
    health: "/api/health",
  });
});

// =====================================
// Health Check
// =====================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "meeting-assistant-api",
    timestamp: new Date(),
  });
});

// =====================================
// API Routes
// =====================================

app.use(
  "/api/auth",
  require("./routes/auth.routes")
);

app.use(
  "/api/users",
  require("./routes/users.routes")
);

app.use(
  "/api/meetings",
  require("./routes/meetings.routes")
);

app.use(
  "/api/recordings",
  require("./routes/recordings.routes")
);

app.use(
  "/api/notes",
  require("./routes/notes.routes")
);

app.use(
  "/api/reports",
  require("./routes/reports.routes")
);

app.use(
  "/api/chatbot",
  require("./routes/chatbot.routes")
);

app.use(
  "/api/emails",
  require("./routes/emails.routes")
);

app.use(
  "/api/suggestions",
  require("./routes/suggestions.routes")
);

app.use(
  "/api/knowledge",
  require("./routes/knowledge.routes")
);

// =====================================
// Static Files
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

app.use(
  "/recordings",
  express.static(
    path.join(__dirname, "../recordings")
  )
);

// =====================================
// Error Handler
// =====================================

app.use((err, req, res, next) => {
  logger.error(err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =====================================
// Start Server
// =====================================

app.listen(PORT, () => {
  logger.info(
    `Meeting Assistant API running on port ${PORT}`
  );

  logger.info(
    `Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );
});

module.exports = app;