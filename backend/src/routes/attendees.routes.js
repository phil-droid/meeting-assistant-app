const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const attendees = new Map();

// Register meeting attendee
router.post('/', (req, res) => {
  try {
    const { meetingId, email, name, role } = req.body;

    if (!meetingId || !email) {
      return res.status(400).json({ message: 'meetingId and email are required' });
    }

    const id = `${meetingId}-${email}`;
    const attendee = {
      id,
      meetingId,
      email,
      name: name || 'Unknown',
      role: role || 'Participant',
      joinedAt: new Date(),
      status: 'present'
    };

    attendees.set(id, attendee);

    res.status(201).json({
      success: true,
      message: 'Attendee registered',
      data: attendee
    });
  } catch (error) {
    logger.error('Register attendee error:', error);
    res.status(500).json({ message: 'Failed to register attendee' });
  }
});

// Get meeting attendees
router.get('/meeting/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const meetingAttendees = Array.from(attendees.values())
      .filter(a => a.meetingId === meetingId);

    res.json({
      success: true,
      data: meetingAttendees,
      count: meetingAttendees.length
    });
  } catch (error) {
    logger.error('Get attendees error:', error);
    res.status(500).json({ message: 'Failed to fetch attendees' });
  }
});

module.exports = router;
