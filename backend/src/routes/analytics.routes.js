const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const logger = require('../utils/logger');

// Analyze meeting sentiment
router.post('/sentiment', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const prompt = `Analyze the sentiment of this meeting transcript. Provide:
1. Overall sentiment (Positive, Negative, Neutral, Mixed)
2. Sentiment score (0-100)
3. Key emotional indicators
4. Team engagement level
5. Recommendations for team dynamics

Transcript:
${transcript}`;

    const response = await liteLLM.generateText(prompt);
    const analysis = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        analysis,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze sentiment' });
  }
});

// Generate meeting summary
router.post('/summary', async (req, res) => {
  try {
    const { transcript, meetingType } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const prompt = `Create a concise executive summary of this ${meetingType || 'meeting'}. Include:
1. Main objectives
2. Key outcomes
3. Critical decisions
4. Next steps
5. Timeline

Keep it to 150-200 words.

Transcript:
${transcript}`;

    const response = await liteLLM.generateText(prompt);
    const summary = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        summary,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Summary generation error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// Extract key topics
router.post('/topics', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const prompt = `Extract the key topics discussed in this meeting transcript. For each topic, provide:
1. Topic name
2. Duration/importance (High, Medium, Low)
3. Brief description
4. Related action items

Format as JSON array.

Transcript:
${transcript}`;

    const response = await liteLLM.generateText(prompt);
    const content = response.choices[0].message.content;

    let topics = [];
    try {
      topics = JSON.parse(content);
    } catch (e) {
      topics = [{ name: 'Meeting Discussion', description: content }];
    }

    res.json({
      success: true,
      data: {
        topics,
        count: topics.length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Topic extraction error:', error);
    res.status(500).json({ message: 'Failed to extract topics' });
  }
});

module.exports = router;
