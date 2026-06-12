const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const screenRecordings = new Map();

// Start screen recording session
router.post('/start', (req, res) => {
  try {
    const { meetingId, userId } = req.body;
    const recordingSessionId = uuidv4();

    const session = {
      id: recordingSessionId,
      meetingId,
      userId,
      startedAt: new Date(),
      status: 'recording',
      chunks: [],
      duration: 0
    };

    screenRecordings.set(recordingSessionId, session);

    res.status(201).json({
      success: true,
      message: 'Recording session started',
      data: session
    });
  } catch (error) {
    logger.error('Start recording error:', error);
    res.status(500).json({ message: 'Failed to start recording' });
  }
});

// Stop screen recording session
router.post('/:sessionId/stop', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = screenRecordings.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Recording session not found' });
    }

    const endTime = new Date();
    session.status = 'stopped';
    session.duration = (endTime - session.startedAt) / 1000; // Duration in seconds
    session.stoppedAt = endTime;

    screenRecordings.set(sessionId, session);

    res.json({
      success: true,
      message: 'Recording session stopped',
      data: session
    });
  } catch (error) {
    logger.error('Stop recording error:', error);
    res.status(500).json({ message: 'Failed to stop recording' });
  }
});

// Pause recording
router.post('/:sessionId/pause', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = screenRecordings.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Recording session not found' });
    }

    session.status = 'paused';
    session.pausedAt = new Date();
    screenRecordings.set(sessionId, session);

    res.json({
      success: true,
      message: 'Recording paused',
      data: session
    });
  } catch (error) {
    logger.error('Pause recording error:', error);
    res.status(500).json({ message: 'Failed to pause recording' });
  }
});

// Resume recording
router.post('/:sessionId/resume', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = screenRecordings.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Recording session not found' });
    }

    session.status = 'recording';
    screenRecordings.set(sessionId, session);

    res.json({
      success: true,
      message: 'Recording resumed',
      data: session
    });
  } catch (error) {
    logger.error('Resume recording error:', error);
    res.status(500).json({ message: 'Failed to resume recording' });
  }
});

// Get recording session
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = screenRecordings.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Recording session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    logger.error('Get recording session error:', error);
    res.status(500).json({ message: 'Failed to fetch recording session' });
  }
});

module.exports = router;
