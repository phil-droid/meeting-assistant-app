const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const notes = new Map();

// Generate notes from recording
router.post('/generate', async (req, res) => {
  try {
    const { recordingId, meetingId, transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const prompt = `You are a professional meeting note taker. Generate comprehensive meeting notes from the following transcript. Include:
- Key discussion points
- Action items with owners
- Decisions made
- Important metrics or deadlines
- Questions raised

Transcript:
${transcript}

Provide the notes in a structured format.`;

    const response = await liteLLM.generateText(prompt);
    const generatedNotes = response.choices[0].message.content;

    const noteId = uuidv4();
    const notesData = {
      id: noteId,
      recordingId,
      meetingId,
      content: generatedNotes,
      transcript,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notes.set(noteId, notesData);

    res.status(201).json({
      success: true,
      message: 'Notes generated successfully',
      data: notesData
    });
  } catch (error) {
    logger.error('Generate notes error:', error);
    res.status(500).json({ message: 'Failed to generate notes' });
  }
});

// Get all notes
router.get('/', (req, res) => {
  try {
    const notesList = Array.from(notes.values());
    res.json({
      success: true,
      data: notesList,
      count: notesList.length
    });
  } catch (error) {
    logger.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Get specific notes
router.get('/:noteId', (req, res) => {
  try {
    const { noteId } = req.params;
    const note = notes.get(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Notes not found' });
    }

    res.json({ success: true, data: note });
  } catch (error) {
    logger.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Update notes
router.put('/:noteId', (req, res) => {
  try {
    const { noteId } = req.params;
    const note = notes.get(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Notes not found' });
    }

    const updated = {
      ...note,
      ...req.body,
      id: noteId,
      updatedAt: new Date()
    };
    notes.set(noteId, updated);

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error('Update notes error:', error);
    res.status(500).json({ message: 'Failed to update notes' });
  }
});

module.exports = router;
