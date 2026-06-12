const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const users = new Map();

// Get user profile
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = { ...user, ...req.body, id: userId };
    users.set(userId, updated);

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

module.exports = router;
