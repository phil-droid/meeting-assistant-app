const mongoose = require("mongoose");

const KnowledgeFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
    },

    size: {
      type: Number,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "processing",
    },

    totalChunks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "KnowledgeFile",
  KnowledgeFileSchema
);