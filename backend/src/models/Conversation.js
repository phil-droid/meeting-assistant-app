const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true, unique: true },
    title:        { type: String, default: "New Conversation" },
    context:      { type: String, default: "" },
    messageCount: { type: Number, default: 0 },
    updatedAt:    { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
