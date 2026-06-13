const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const logger = require("../utils/logger");
const { extractText } = require("../utils/extractText");
const embeddingService = require("../services/embedding.service");

/**
 * ===========================================
 * MONGOOSE MODEL
 * ===========================================
 */
const Knowledge = require("../models/Knowledge");

/**
 * ===========================================
 * FILE STORAGE CONFIG
 * ===========================================
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/knowledge";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/**
 * ===========================================
 * TEXT CHUNKING FUNCTION
 * ===========================================
 */
function chunkText(text, chunkSize = 800, overlap = 150) {
  const chunks = [];

  let i = 0;

  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }

  return chunks;
}

/**
 * ===========================================
 * UPLOAD + PROCESS KNOWLEDGE FILE
 * ===========================================
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    /**
     * STEP 1: Extract raw text
     */
    const text = await extractText(filePath, mimeType);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Could not extract text from file"
      });
    }

    /**
     * STEP 2: Chunk text
     */
    const chunks = chunkText(text);

    /**
     * STEP 3: Generate embeddings for each chunk
     */
    const embeddedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkTextValue = chunks[i];

      const embedding =
        await embeddingService.createEmbedding(
          chunkTextValue
        );

      embeddedChunks.push({
        chunkIndex: i,
        text: chunkTextValue,
        embedding
      });
    }

    /**
     * STEP 4: Save to MongoDB
     */
    const knowledgeDoc = new Knowledge({
      id: uuidv4(),
      filename: req.file.originalname,
      filePath,
      mimeType,
      rawText: text,
      chunks: embeddedChunks,
      createdAt: new Date()
    });

    await knowledgeDoc.save();

    res.status(201).json({
      success: true,
      message: "Knowledge uploaded and processed",
      data: {
        id: knowledgeDoc.id,
        filename: knowledgeDoc.filename,
        chunks: chunks.length
      }
    });
  } catch (error) {
    logger.error("Knowledge upload error:", error);

    res.status(500).json({
      message: "Failed to process knowledge file"
    });
  }
});

/**
 * ===========================================
 * GET ALL KNOWLEDGE FILES
 * ===========================================
 */
router.get("/", async (req, res) => {
  try {
    const docs = await Knowledge.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (error) {
    logger.error("Fetch knowledge error:", error);

    res.status(500).json({
      message: "Failed to fetch knowledge base"
    });
  }
});

/**
 * ===========================================
 * DELETE KNOWLEDGE FILE
 * ===========================================
 */
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Knowledge.findOne({
      id: req.params.id
    });

    if (!doc) {
      return res.status(404).json({
        message: "Knowledge not found"
      });
    }

    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await Knowledge.deleteOne({ id: req.params.id });

    res.json({
      success: true,
      message: "Knowledge deleted"
    });
  } catch (error) {
    logger.error("Delete knowledge error:", error);

    res.status(500).json({
      message: "Failed to delete knowledge"
    });
  }
});

module.exports = router;
