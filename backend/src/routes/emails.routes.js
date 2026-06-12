const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const emails = new Map();

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate email draft
router.post('/generate-draft', async (req, res) => {
  try {
    const { meetingTitle, attendees, meetingNotes, actionItems, recipientEmail } = req.body;

    if (!meetingNotes && !actionItems) {
      return res.status(400).json({ message: 'Meeting notes or action items are required' });
    }

    const prompt = `Draft a professional follow-up email after a meeting.

Meeting Title: ${meetingTitle}
Attendees: ${attendees ? attendees.join(', ') : 'Team'}

Meeting Notes:
${meetingNotes || 'N/A'}

Action Items:
${actionItems || 'N/A'}

Generate a professional, concise follow-up email that:
1. Thanks participants
2. Summarizes key discussion points
3. Lists action items clearly
4. Sets expectations for next steps
5. Includes appropriate sign-off

Make it warm but professional.`;

    const response = await liteLLM.generateText(prompt);
    const emailContent = response.choices[0].message.content;

    const emailId = uuidv4();
    const emailDraft = {
      id: emailId,
      to: recipientEmail,
      subject: `Meeting Follow-up: ${meetingTitle}`,
      body: emailContent,
      status: 'draft',
      createdAt: new Date(),
      sentAt: null
    };

    emails.set(emailId, emailDraft);

    res.status(201).json({
      success: true,
      message: 'Email draft generated successfully',
      data: emailDraft
    });
  } catch (error) {
    logger.error('Generate email draft error:', error);
    res.status(500).json({ message: 'Failed to generate email draft' });
  }
});

// Send email
router.post('/:emailId/send', async (req, res) => {
  try {
    const { emailId } = req.params;
    const email = emails.get(emailId);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.status === 'sent') {
      return res.status(400).json({ message: 'Email has already been sent' });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email.to,
      subject: email.subject,
      html: `<pre>${email.body}</pre>`
    };

    await transporter.sendMail(mailOptions);

    email.status = 'sent';
    email.sentAt = new Date();
    emails.set(emailId, email);

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: email
    });
  } catch (error) {
    logger.error('Send email error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Get all emails
router.get('/', (req, res) => {
  try {
    const emailsList = Array.from(emails.values());
    res.json({
      success: true,
      data: emailsList,
      count: emailsList.length
    });
  } catch (error) {
    logger.error('Get emails error:', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});

// Get specific email
router.get('/:emailId', (req, res) => {
  try {
    const { emailId } = req.params;
    const email = emails.get(emailId);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.json({ success: true, data: email });
  } catch (error) {
    logger.error('Get email error:', error);
    res.status(500).json({ message: 'Failed to fetch email' });
  }
});

module.exports = router;
