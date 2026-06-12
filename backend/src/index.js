app.get("/", (req, res) => {
  res.json({
    app: "Meeting Assistant API",
    status: "Running",
    version: "1.0.0"
  });
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * =========================
 * DATABASE CONNECTION
 * =========================
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: 'meeting-assistant-api'
  });
});

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/meetings', require('./routes/meetings.routes'));
app.use('/api/recordings', require('./routes/recordings.routes'));
app.use('/api/notes', require('./routes/notes.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/suggestions', require('./routes/suggestions.routes'));
app.use('/api/emails', require('./routes/emails.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));
app.use('/api/users', require('./routes/users.routes'));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/meetings', require('./routes/meetings.routes'));
app.use('/api/recordings', require('./routes/recordings.routes'));
app.use('/api/notes', require('./routes/notes.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/suggestions', require('./routes/suggestions.routes'));
app.use('/api/emails', require('./routes/emails.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));
app.use('/api/users', require('./routes/users.routes'));

// Knowledge Base Routes
app.use('/api/knowledge', require('./routes/knowledge.routes'));

/**
 * =========================
 * STATIC FILES
 * =========================
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/recordings', express.static(path.join(__dirname, '../recordings')));

/**
 * =========================
 * ERROR HANDLING
 * =========================
 */
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

/**
 * =========================
 * 404 HANDLER
 * =========================
 */
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

/**
 * =========================
 * START SERVER
 * =========================
 */
app.listen(PORT, () => {
  logger.info(`Meeting Assistant API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;