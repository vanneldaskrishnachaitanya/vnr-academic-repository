'use strict';
const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  fileId:  { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars:   { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 300, trim: true },
}, { timestamps: true });

RatingSchema.index({ fileId: 1, userId: 1 }, { unique: true });
RatingSchema.index({ fileId: 1 });

module.exports = mongoose.model('Rating', RatingSchema);
