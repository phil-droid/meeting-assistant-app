const express = require("express");
const router = express.Router();

const { v4: uuidv4 } = require("uuid");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const liteLLM = require("../config/litellm.config");
const logger = require("../utils/logger");

const {
  searchKnowledge,
} = require("../services/rag.services");

/*
====================================
Create Conversation
====================================
*/

router.post("/conversations", async (req, res) => {
  try {
    const { title, context } = req.body;

    const conversation = await Conversation.create({
      id: uuidv4(),
      title: title || "New Conversation",
      context: context || "",
      messageCount: 0,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    logger.error(err);

    res.status(500).json({
      message: "Failed to create conversation",
    });
  }
});

/*
====================================
Send Message
====================================
*/

router.post(
  "/conversations/:conversationId/messages",
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          message: "Message required",
        });
      }

      const conversation =
        await Conversation.findOne({
          id: conversationId,
        });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      /*
      ====================================
      Save User Message
      ====================================
      */

      await Message.create({
        conversationId,
        role: "user",
        content: message,
      });

      /*
      ====================================
      RAG SEARCH
      ====================================
      */

      const retrieved =
        await searchKnowledge(message);

      const ragContext = retrieved
        .map(
          (item) =>
            `SOURCE: ${item.filename}

${item.text}`
        )
        .join("\n\n-----------------\n\n");

      /*
      ====================================
      Load Previous Messages
      ====================================
      */

      const history = await Message.find({
        conversationId,
      })
        .sort({
          createdAt: 1,
        })
        .limit(20);

      /*
      ====================================
      Build Prompt
      ====================================
      */

      const messages = [
        {
          role: "system",
          content: `
You are an AI Meeting Assistant.

You MUST answer primarily from the retrieved knowledge.

If the retrieved context contains the answer,
use it.

If it does NOT contain the answer,
say that the information was not found
instead of inventing facts.

Retrieved Knowledge:

${ragContext}

Conversation Context:

${conversation.context || ""}
`,
        },

        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      /*
      ====================================
      LiteLLM
      ====================================
      */

      const response =
        await liteLLM.chat(messages);

      const assistant =
        response?.choices?.[0]?.message
          ?.content ||
        "No response generated.";

      /*
      ====================================
      Save Assistant Message
      ====================================
      */

      await Message.create({
        conversationId,
        role: "assistant",
        content: assistant,
      });

      /*
      ====================================
      Update Metadata
      ====================================
      */

      conversation.messageCount += 1;
      conversation.updatedAt = new Date();

      await conversation.save();

      res.json({
        success: true,

        data: {
          conversationId,

          assistantMessage: assistant,

          retrievedSources:
            retrieved.map(
              (r) => r.filename
            ),

          chunksUsed:
            retrieved.length,
        },
      });
    } catch (err) {
      logger.error(err);

      res.status(500).json({
        message: "Chat failed",
      });
    }
  }
);

/*
====================================
Conversation History
====================================
*/

router.get(
  "/conversations/:conversationId/messages",
  async (req, res) => {
    try {
      const { conversationId } =
        req.params;

      const conversation =
        await Conversation.findOne({
          id: conversationId,
        });

      if (!conversation) {
        return res.status(404).json({
          message:
            "Conversation not found",
        });
      }

      const messages =
        await Message.find({
          conversationId,
        }).sort({
          createdAt: 1,
        });

      res.json({
        success: true,

        data: {
          conversation,

          messages,
        },
      });
    } catch (err) {
      logger.error(err);

      res.status(500).json({
        message:
          "Failed to fetch conversation",
      });
    }
  }
);

/*
====================================
All Conversations
====================================
*/

router.get(
  "/conversations",
  async (req, res) => {
    try {
      const conversations =
        await Conversation.find().sort({
          updatedAt: -1,
        });

      res.json({
        success: true,

        count:
          conversations.length,

        data: conversations,
      });
    } catch (err) {
      logger.error(err);

      res.status(500).json({
        message:
          "Failed to fetch conversations",
      });
    }
  }
);

/*
====================================
Delete Conversation
====================================
*/

router.delete(
  "/conversations/:conversationId",
  async (req, res) => {
    try {
      const { conversationId } =
        req.params;

      await Conversation.deleteOne({
        id: conversationId,
      });

      await Message.deleteMany({
        conversationId,
      });

      res.json({
        success: true,

        message:
          "Conversation deleted",
      });
    } catch (err) {
      logger.error(err);

      res.status(500).json({
        message:
          "Delete failed",
      });
    }
  }
);

module.exports = router;