const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const logger = require('../utils/logger');

// Get meeting recommendations
router.post('/', async (req, res) => {
  try {
    const { meetingNotes, reportContent, goals, constraints } = req.body;

    if (!meetingNotes && !reportContent) {
      return res.status(400).json({ message: 'Meeting notes or report is required' });
    }

    const context = meetingNotes || reportContent;

    const prompt = `Based on this meeting discussion, provide strategic recommendations for:

${goals ? `Goals: ${goals}\n` : ''}
${constraints ? `Constraints: ${constraints}\n` : ''}

Meeting Context:
${context}

Provide recommendations in these categories:
1. Short-term actions (1-2 weeks)
2. Medium-term initiatives (1-3 months)
3. Long-term strategy (3+ months)
4. Risk mitigation
5. Resource optimization
6. Performance metrics to track

Make recommendations specific, measurable, and actionable.`;

    const response = await liteLLM.generateText(prompt);
    const recommendations = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        recommendations,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

// Get follow-up questions for deeper insights
router.post('/questions', async (req, res) => {
  try {
    const { meetingNotes, reportContent } = req.body;

    if (!meetingNotes && !reportContent) {
      return res.status(400).json({ message: 'Meeting notes or report is required' });
    }

    const context = meetingNotes || reportContent;

    const prompt = `Based on this meeting, generate 5-7 strategic follow-up questions that should be addressed:

Meeting Context:
${context}

Questions should:
1. Clarify ambiguous decisions
2. Identify gaps in planning
3. Challenge assumptions
4. Explore opportunities
5. Ensure alignment across teams

Format as a numbered list.`;

    const response = await liteLLM.generateText(prompt);
    const questions = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        questions,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Questions generation error:', error);
    res.status(500).json({ message: 'Failed to generate questions' });
  }
});

module.exports = router;
