const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');

/**
 * =========================
 * STORAGE CONFIG
 * =========================
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.RECORDINGS_DIR || './recordings';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `recording-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 500000000)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp3'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, WebM, MP3 files allowed'));
    }
  }
});

/**
 * =========================
 * IN-MEMORY STORAGE
 * =========================
 */
const recordings = new Map();

/**
 * =========================
 * AI PIPELINE (ASYNC PROCESSOR)
 * =========================
 */
async function processRecording(recordingId) {
  const recording = recordings.get(recordingId);
  if (!recording) return;

  try {
    logger.info(`Processing recording: ${recordingId}`);

    recording.status = 'processing';
    recordings.set(recordingId, recording);

    /**
     * 1. TRANSCRIPTION
     */
    const transcript = await aiService.transcribeAudio(recording.filepath);
    recording.transcription = transcript;

    /**
     * 2. SUMMARY
     */
    const summary = await aiService.summarize(transcript);
    recording.summary = summary;

    /**
     * 3. ACTION ITEMS
     */
    const actions = await aiService.extractActions(transcript);
    recording.actions = actions;

    /**
     * 4. REPORT GENERATION
     */
    const report = await aiService.generateReport({
      title: recording.title,
      transcript,
      summary,
      actions
    });

    recording.report = report;

    /**
     * FINAL STATE
     */
    recording.status = 'completed';
    recording.processedAt = new Date();

    recordings.set(recordingId, recording);

    logger.info(`Recording processed successfully: ${recordingId}`);

  } catch (error) {
    logger.error('Recording processing failed:', error);

    recording.status = 'failed';
    recording.error = error.message;

    recordings.set(recordingId, recording);
  }
}

/**
 * =========================
 * UPLOAD RECORDING
 * =========================
 */
router.post('/upload', upload.single('recording'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No recording uploaded' });
    }

    const recordingId = uuidv4();
    const { meetingId, title } = req.body;

    const recording = {
      id: recordingId,
      meetingId: meetingId || null,
      title: title || req.file.originalname,
      filename: req.file.filename,
      filepath: path.join(process.env.RECORDINGS_DIR || './recordings', req.file.filename),
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),

      // AI fields
      status: 'uploaded',
      transcription: null,
      summary: null,
      actions: null,
      report: null
    };

    recordings.set(recordingId, recording);

    // async pipeline (non-blocking)
    processRecording(recordingId);

    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      data: recording
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload recording' });
  }
});

/**
 * =========================
 * GET ALL RECORDINGS
 * =========================
 */
router.get('/', (req, res) => {
  try {
    const list = Array.from(recordings.values());

    res.json({
      success: true,
      count: list.length,
      data: list
    });

  } catch (error) {
    logger.error('Fetch recordings error:', error);
    res.status(500).json({ message: 'Failed to fetch recordings' });
  }
});

/**
 * =========================
 * GET SINGLE RECORDING
 * =========================
 */
router.get('/:recordingId', (req, res) => {
  try {
    const recording = recordings.get(req.params.recordingId);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    res.json({
      success: true,
      data: recording
    });

  } catch (error) {
    logger.error('Get recording error:', error);
    res.status(500).json({ message: 'Failed to fetch recording' });
  }
});

/**
 * =========================
 * DELETE RECORDING
 * =========================
 */
router.delete('/:recordingId', (req, res) => {
  try {
    const recording = recordings.get(req.params.recordingId);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const filePath = path.join(
      process.env.RECORDINGS_DIR || './recordings',
      recording.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    recordings.delete(req.params.recordingId);

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });

  } catch (error) {
    logger.error('Delete recording error:', error);
    res.status(500).json({ message: 'Failed to delete recording' });
  }
});

module.exports = router;
module.exports.recordings = recordings;