const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Mock data storage
const meetings = new Map();

// Get all meetings
router.get('/', (req, res) => {
  try {
    const meetingsList = Array.from(meetings.values());
    res.json({
      success: true,
      data: meetingsList,
      count: meetingsList.length
    });
  } catch (error) {
    logger.error('Get meetings error:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// Create new meeting
router.post('/', (req, res) => {
  try {
    const { title, description, participants, scheduledFor } = req.body;
    const meetingId = require('uuid').v4();

    const meeting = {
      id: meetingId,
      title,
      description,
      participants,
      scheduledFor: new Date(scheduledFor),
      createdAt: new Date(),
      status: 'scheduled',
      recordingId: null,
      notes: null,
      report: null
    };

    meetings.set(meetingId, meeting);

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meeting
    });
  } catch (error) {
    logger.error('Create meeting error:', error);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Get specific meeting
router.get('/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = meetings.get(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    logger.error('Get meeting error:', error);
    res.status(500).json({ message: 'Failed to fetch meeting' });
  }
});

// Update meeting
router.put('/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = meetings.get(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const updated = { ...meeting, ...req.body, id: meetingId };
    meetings.set(meetingId, updated);

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error('Update meeting error:', error);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

// Delete meeting
router.delete('/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = meetings.get(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meetings.delete(meetingId);

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    logger.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

module.exports = router;
