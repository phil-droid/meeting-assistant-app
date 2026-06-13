const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    role:           { type: String, enum: ["user", "assistant", "system"], required: true },
    content:        { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
