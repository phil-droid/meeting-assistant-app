const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const suggestions = new Map();

// Generate suggestions from meeting outcomes
router.post('/generate', async (req, res) => {
  try {
    const { meetingId, meetingNotes, reportContent, decisions } = req.body;

    if (!meetingNotes && !reportContent) {
      return res.status(400).json({ message: 'Meeting notes or report content is required' });
    }

    const context = meetingNotes || reportContent;

    const prompt = `Based on the following meeting summary and decisions, provide intelligent suggestions and recommendations for follow-up actions and improvements:

Meeting Context:
${context}

${decisions ? `Key Decisions Made:\n${decisions}` : ''}

Please provide:
1. Follow-up recommendations
2. Risk areas to monitor
3. Opportunities identified
4. Best practices to implement
5. Timeline for next steps

Be specific and actionable in your suggestions.`;

    const response = await liteLLM.generateText(prompt);
    const suggestionsContent = response.choices[0].message.content;

    const suggestionId = uuidv4();
    const suggestionsData = {
      id: suggestionId,
      meetingId,
      content: suggestionsContent,
      generatedAt: new Date(),
      sourceType: 'meeting_outcome'
    };

    suggestions.set(suggestionId, suggestionsData);

    res.status(201).json({
      success: true,
      message: 'Suggestions generated successfully',
      data: suggestionsData
    });
  } catch (error) {
    logger.error('Generate suggestions error:', error);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
});

// Get all suggestions
router.get('/', (req, res) => {
  try {
    const suggestionsList = Array.from(suggestions.values());
    res.json({
      success: true,
      data: suggestionsList,
      count: suggestionsList.length
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
});

// Get specific suggestion
router.get('/:suggestionId', (req, res) => {
  try {
    const { suggestionId } = req.params;
    const suggestion = suggestions.get(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json({ success: true, data: suggestion });
  } catch (error) {
    logger.error('Get suggestion error:', error);
    res.status(500).json({ message: 'Failed to fetch suggestion' });
  }
});

module.exports = router;
