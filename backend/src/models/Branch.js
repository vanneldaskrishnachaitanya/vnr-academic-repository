'use strict';
const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  label:     { type: String, required: true, trim: true, maxlength: 100 },
  emoji:     { type: String, default: '📁' },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

BranchSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Branch', BranchSchema);
