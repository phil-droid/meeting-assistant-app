const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  meetingId: String,
  title: String,
  filename: String,
  filepath: String,
  size: Number,
  duration: Number,
  transcription: String,
  summary: String,
  status: {
    type: String,
    default: 'processing'
  }
}, { timestamps: true });

module.exports = mongoose.model('Recording', RecordingSchema);