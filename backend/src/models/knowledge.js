const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    chunkIndex: { type: Number, required: true },
    text:       { type: String, required: true },
    embedding:  { type: [Number], default: [] }
  },
  { _id: false }
);

const knowledgeSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true, unique: true },
    filename:  { type: String, required: true },
    filePath:  { type: String, required: true },
    mimeType:  { type: String, required: true },
    rawText:   { type: String, default: "" },
    chunks:    { type: [chunkSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
