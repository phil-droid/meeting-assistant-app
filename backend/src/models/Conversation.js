const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Conversation'
  },
  context: {
    type: String,
    default: ''
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);