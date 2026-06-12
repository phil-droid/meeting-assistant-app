const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const reports = new Map();

// Generate report
router.post('/generate', async (req, res) => {
  try {
    const { meetingId, meetingTitle, notes, attendees } = req.body;

    if (!notes) {
      return res.status(400).json({ message: 'Notes are required to generate report' });
    }

    const prompt = `Create a professional meeting report based on the following meeting notes.
Meeting Title: ${meetingTitle}
Attendees: ${attendees ? attendees.join(', ') : 'Not specified'}

Meeting Notes:
${notes}

Generate a comprehensive report including:
1. Executive Summary
2. Agenda Items Discussed
3. Key Decisions
4. Action Items (with owners and due dates)
5. Next Steps
6. Attachments/References (if any)

Format the report professionally.`;

    const response = await liteLLM.generateText(prompt);
    const reportContent = response.choices[0].message.content;

    const reportId = uuidv4();
    const report = {
      id: reportId,
      meetingId,
      title: `Report: ${meetingTitle}`,
      content: reportContent,
      notes,
      attendees,
      generatedAt: new Date(),
      updatedAt: new Date()
    };

    reports.set(reportId, report);

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get all reports
router.get('/', (req, res) => {
  try {
    const reportsList = Array.from(reports.values());
    res.json({
      success: true,
      data: reportsList,
      count: reportsList.length
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Get specific report
router.get('/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = reports.get(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
});

module.exports = router;
