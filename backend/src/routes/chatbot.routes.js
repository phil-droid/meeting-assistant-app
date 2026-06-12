const express = require('express');
const router = express.Router();
const liteLLM = require('../config/litellm.config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const conversations = new Map();
const conversationHistories = new Map();

// Start new conversation
router.post('/conversations', (req, res) => {
  try {
    const { title, context } = req.body;
    const conversationId = uuidv4();

    const conversation = {
      id: conversationId,
      title: title || 'New Conversation',
      context: context || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    };

    conversations.set(conversationId, conversation);
    conversationHistories.set(conversationId, []);

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      data: conversation
    });
  } catch (error) {
    logger.error('Start conversation error:', error);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
});

// Send message and get response
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

    // Build system prompt with context
    const systemMessage = conversation.context
      ? `You are an AI assistant helping with meeting insights. Context: ${conversation.context}`
      : 'You are an AI assistant helping with meeting insights and follow-up actions.';

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    });

    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemMessage },
      ...history.slice(-10) // Keep last 10 messages for context
    ];

    // Get response from LiteLLM
    const response = await liteLLM.chat(messages);
    const assistantMessage = response.choices[0].message.content;

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: assistantMessage
    });

    conversationHistories.set(conversationId, history);

    // Update conversation
    conversation.messageCount = history.length / 2; // Divide by 2 because we store both user and assistant messages
    conversation.updatedAt = new Date();
    conversations.set(conversationId, conversation);

    res.json({
      success: true,
      data: {
        conversationId,
        userMessage: message,
        assistantMessage,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

// Get conversation history
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
    logger.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

// Get all conversations
router.get('/conversations', (req, res) => {
  try {
    const conversationsList = Array.from(conversations.values());
    res.json({
      success: true,
      data: conversationsList,
      count: conversationsList.length
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversations.delete(conversationId);
    conversationHistories.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

module.module = router;
