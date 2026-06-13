const mongoose = require("mongoose");

const ChunkSchema = new mongoose.Schema({
  chunkIndex: {
    type: Number,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  embedding: {
    type: [Number],
    default: []
  }
});

const KnowledgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },

  filename: {
    type: String,
    required: true
  },

  filePath: {
    type: String,
    required: true
  },

  mimeType: {
    type: String,
    required: true
  },

  rawText: {
    type: String,
    default: ""
  },

  chunks: [ChunkSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "Knowledge",
  KnowledgeSchema
);