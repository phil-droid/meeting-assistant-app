const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Setup multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.RECORDINGS_DIR || './recordings';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500000000 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, and MP3 are allowed.'));
    }
  }
});

const recordings = new Map();

// Upload recording
router.post('/upload', upload.single('recording'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const recordingId = uuidv4();
    const { meetingId, title } = req.body;

    const recording = {
      id: recordingId,
      meetingId,
      title: title || req.file.originalname,
      filename: req.file.filename,
      filepath: `/recordings/${req.file.filename}`,
      size: req.file.size,
      duration: null,
      uploadedAt: new Date(),
      transcription: null,
      status: 'processing'
    };

    recordings.set(recordingId, recording);

    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      data: recording
    });
  } catch (error) {
    logger.error('Recording upload error:', error);
    res.status(500).json({ message: 'Failed to upload recording' });
  }
});

// Get all recordings
router.get('/', (req, res) => {
  try {
    const recordingsList = Array.from(recordings.values());
    res.json({
      success: true,
      data: recordingsList,
      count: recordingsList.length
    });
  } catch (error) {
    logger.error('Get recordings error:', error);
    res.status(500).json({ message: 'Failed to fetch recordings' });
  }
});

// Get specific recording
router.get('/:recordingId', (req, res) => {
  try {
    const { recordingId } = req.params;
    const recording = recordings.get(recordingId);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    res.json({ success: true, data: recording });
  } catch (error) {
    logger.error('Get recording error:', error);
    res.status(500).json({ message: 'Failed to fetch recording' });
  }
});

// Delete recording
router.delete('/:recordingId', (req, res) => {
  try {
    const { recordingId } = req.params;
    const recording = recordings.get(recordingId);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Delete file from storage
    const filepath = path.join(process.env.RECORDINGS_DIR || './recordings', recording.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    recordings.delete(recordingId);

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
