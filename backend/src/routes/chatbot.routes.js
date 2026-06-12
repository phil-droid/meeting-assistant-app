const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const logger = require('../utils/logger');

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// RAG SERVICE (meeting memory)
const ragService = require('../services/rag.service');



/**
 * =========================
 * CREATE NEW CONVERSATION (MONGODB)
 * =========================
 */
router.post('/conversations', async (req, res) => {
  try {
    const { title, context } = req.body;

    const conversation = await Conversation.create({
      title: title || 'New Meeting Conversation',
      context: context || '',
      messageCount: 0
    });

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
 * SEND MESSAGE (RAG + MONGO + LLM)
 * =========================
 */
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }



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
     * SAVE USER MESSAGE
     * =========================
     */
    await Message.create({
      conversationId,
      role: 'user',
      content: message
    });



    /**
     * =========================
     * FETCH RECENT HISTORY
     * =========================
     */
    const history = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    history.reverse();



    /**
     * =========================
     * SYSTEM PROMPT (RAG + CONTEXT)
     * =========================
     */
    const systemMessage = `
You are a Meeting Intelligence Assistant.

You answer using:
1. Conversation history
2. Meeting recordings (RAG context)

RULES:
- Prioritize meeting data when relevant
- If found in recordings, reference it
- If not found, say you lack data

MODE: ${mode}

========================
MEETING CONTEXT
========================
${ragContext}

========================
USER MEETING CONTEXT
========================
${conversation.context || 'None'}
`;



    /**
     * =========================
     * BUILD LLM INPUT
     * =========================
     */
    const messages = [
      { role: 'system', content: systemMessage },
      ...history.map(m => ({
        role: m.role,
        content: m.content
      }))
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
    await Message.create({
      conversationId,
      role: 'assistant',
      content: assistantMessage
    });



    /**
     * =========================
     * UPDATE CONVERSATION
     * =========================
     */
    await Conversation.findByIdAndUpdate(conversationId, {
      $inc: { messageCount: 1 },
      updatedAt: new Date()
    });



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
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        conversation,
        messages
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
router.get('/conversations', async (req, res) => {
  try {
    const list = await Conversation.find().sort({ createdAt: -1 });

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
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

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