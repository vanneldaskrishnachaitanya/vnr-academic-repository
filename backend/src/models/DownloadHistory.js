'use strict';
const mongoose = require('mongoose');

const DownloadHistorySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileId:     { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  regulation: { type: String },
  branch:     { type: String },
  subject:    { type: String },
  fileName:   { type: String },
}, { timestamps: true });

DownloadHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DownloadHistory', DownloadHistorySchema);
