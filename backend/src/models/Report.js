const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  meetingId: String,
  title: String,
  summary: String,
  actions: [String],
  decisions: [String],
  fullReport: String
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);