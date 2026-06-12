const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// 🔥 RAG SERVICE (meeting memory)
const ragService = require('../services/rag.service');

// In-memory storage
const conversations = new Map();
const conversationHistories = new Map();

/**
 * =========================
 * CREATE NEW CONVERSATION
 * =========================
 */
router.post('/conversations', (req, res) => {
  try {
    const { title, context } = req.body;
    const conversationId = uuidv4();

    const conversation = {
      id: conversationId,
      title: title || 'New Meeting Conversation',
      context: context || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    };

    conversations.set(conversationId, conversation);
    conversationHistories.set(conversationId, []);

    res.status(201).json({
      success: true,
      data: conversation
    });

  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
});

/**
 * =========================
 * SEND MESSAGE (RAG + LLM CORE ENGINE)
 * =========================
 */
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    let history = conversationHistories.get(conversationId) || [];

    /**
     * =========================
     * RAG STEP (MEETING MEMORY)
     * =========================
     */
    const relevantRecordings = ragService.searchRecordings(message);
    const ragContext = ragService.buildContext(relevantRecordings, message);

    /**
     * =========================
     * MODE DETECTION
     * =========================
     */
    const lowerMessage = message.toLowerCase();

    let mode = 'chat';

    if (lowerMessage.includes('summarize')) mode = 'summary';
    else if (lowerMessage.includes('action')) mode = 'actions';
    else if (lowerMessage.includes('email')) mode = 'email';
    else if (lowerMessage.includes('report')) mode = 'report';

    /**
     * =========================
     * SYSTEM PROMPT (RAG-ENHANCED)
     * =========================
     */
    const systemMessage = `
You are a Meeting Intelligence Assistant.

You answer using BOTH:
1. Conversation history
2. Meeting recordings context (RAG)

RULES:
- Always prioritize meeting context if relevant
- If answer is in recordings, reference it clearly
- If not found, say "I don't have enough meeting data"

CURRENT MODE: ${mode}

=========================
MEETING KNOWLEDGE BASE
=========================
${ragContext}

=========================
USER CONTEXT
=========================
${conversation.context || 'None'}

=========================
BEHAVIOR MODES
=========================
chat → normal assistant
summary → meeting summary
actions → action items extraction
email → email draft
report → structured report
`;

    /**
     * =========================
     * SAVE USER MESSAGE
     * =========================
     */
    history.push({
      role: 'user',
      content: message
    });

    /**
     * =========================
     * BUILD LLM INPUT
     * =========================
     */
    const messages = [
      { role: 'system', content: systemMessage },
      ...history.slice(-10)
    ];

    /**
     * =========================
     * CALL LLM
     * =========================
     */
    const response = await liteLLM.chat(messages);

    const assistantMessage =
      response?.choices?.[0]?.message?.content ||
      'No response generated';

    /**
     * =========================
     * SAVE ASSISTANT MESSAGE
     * =========================
     */
    history.push({
      role: 'assistant',
      content: assistantMessage
    });

    conversationHistories.set(conversationId, history);

    /**
     * =========================
     * UPDATE CONVERSATION META
     * =========================
     */
    conversation.messageCount = Math.floor(history.length / 2);
    conversation.updatedAt = new Date();

    conversations.set(conversationId, conversation);

    /**
     * =========================
     * RESPONSE
     * =========================
     */
    res.json({
      success: true,
      data: {
        conversationId,
        mode,
        userMessage: message,
        assistantMessage,
        usedRAG: relevantRecordings.length > 0,
        sourcesFound: relevantRecordings.length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

/**
 * =========================
 * GET CONVERSATION HISTORY
 * =========================
 */
router.get('/conversations/:conversationId/messages', (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const history = conversationHistories.get(conversationId) || [];

    res.json({
      success: true,
      data: {
        conversation,
        messages: history
      }
    });

  } catch (error) {
    logger.error('Fetch conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

/**
 * =========================
 * GET ALL CONVERSATIONS
 * =========================
 */
router.get('/conversations', (req, res) => {
  try {
    const list = Array.from(conversations.values());

    res.json({
      success: true,
      count: list.length,
      data: list
    });

  } catch (error) {
    logger.error('Fetch conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

/**
 * =========================
 * DELETE CONVERSATION
 * =========================
 */
router.delete('/conversations/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversations.has(conversationId)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversations.delete(conversationId);
    conversationHistories.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation deleted'
    });

  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

module.exports = router;