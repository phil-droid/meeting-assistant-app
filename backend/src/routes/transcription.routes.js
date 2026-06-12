const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const transcriptions = new Map();

// Mock transcription service (integrate with Whisper API in production)
router.post('/transcribe', async (req, res) => {
  try {
    const { recordingId, audioUrl } = req.body;

    if (!recordingId || !audioUrl) {
      return res.status(400).json({ message: 'recordingId and audioUrl are required' });
    }

    const transcriptionId = uuidv4();
    const mockTranscription = {
      "text": "This is a sample meeting transcript. The team discussed the Q4 roadmap, budget allocations, and upcoming product launches.",
      "language": "en",
      "segments": [
        { "id": 0, "seek": 0, "start": 0, "end": 5.6, "text": "This is a sample meeting transcript." },
        { "id": 1, "seek": 0, "start": 5.6, "end": 12.5, "text": "The team discussed the Q4 roadmap, budget allocations, and upcoming product launches." }
      ],
      "duration": 12.5
    };

    const transcription = {
      id: transcriptionId,
      recordingId,
      ...mockTranscription,
      processedAt: new Date(),
      status: 'completed'
    };

    transcriptions.set(transcriptionId, transcription);

    res.status(201).json({
      success: true,
      message: 'Transcription completed',
      data: transcription
    });
  } catch (error) {
    logger.error('Transcription error:', error);
    res.status(500).json({ message: 'Failed to transcribe audio' });
  }
});

// Get transcription
router.get('/:transcriptionId', (req, res) => {
  try {
    const { transcriptionId } = req.params;
    const transcription = transcriptions.get(transcriptionId);

    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    res.json({ success: true, data: transcription });
  } catch (error) {
    logger.error('Get transcription error:', error);
    res.status(500).json({ message: 'Failed to fetch transcription' });
  }
});

module.exports = router;
