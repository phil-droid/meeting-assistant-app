const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const actionItems = new Map();

// Extract action items from meeting notes
router.post('/extract', async (req, res) => {
  try {
    const { meetingNotes, meetingTitle } = req.body;

    if (!meetingNotes) {
      return res.status(400).json({ message: 'Meeting notes are required' });
    }

    const prompt = `Extract all action items from the following meeting notes. For each action item, identify:
1. The task description
2. Who is responsible (owner)
3. Due date (if mentioned)
4. Priority level (High, Medium, Low)
5. Related discussion point

Meeting: ${meetingTitle || 'Meeting'}

Notes:
${meetingNotes}

Format the response as a JSON array of action items.`;

    const response = await liteLLM.generateText(prompt);
    const content = response.choices[0].message.content;

    // Parse JSON response
    let items = [];
    try {
      items = JSON.parse(content);
    } catch (e) {
      items = [{ description: content, status: 'pending' }];
    }

    const extractedItems = items.map(item => ({
      id: uuidv4(),
      ...item,
      status: item.status || 'pending',
      createdAt: new Date(),
      completedAt: null
    }));

    extractedItems.forEach(item => actionItems.set(item.id, item));

    res.status(201).json({
      success: true,
      message: 'Action items extracted',
      data: extractedItems
    });
  } catch (error) {
    logger.error('Extract action items error:', error);
    res.status(500).json({ message: 'Failed to extract action items' });
  }
});

// Get all action items
router.get('/', (req, res) => {
  try {
    const itemsList = Array.from(actionItems.values());
    res.json({
      success: true,
      data: itemsList,
      count: itemsList.length
    });
  } catch (error) {
    logger.error('Get action items error:', error);
    res.status(500).json({ message: 'Failed to fetch action items' });
  }
});

// Update action item status
router.put('/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const item = actionItems.get(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    item.status = status || item.status;
    if (status === 'completed') {
      item.completedAt = new Date();
    }
    actionItems.set(itemId, item);

    res.json({
      success: true,
      message: 'Action item updated',
      data: item
    });
  } catch (error) {
    logger.error('Update action item error:', error);
    res.status(500).json({ message: 'Failed to update action item' });
  }
});

module.exports = router;
