'use strict';
const Branch = require('../models/Branch');

const DEFAULT_BRANCHES = [
  { id: 'CSE',   label: 'Computer Science & Engineering',           emoji: '💻' },
  { id: 'ECE',   label: 'Electronics & Communication Engineering',  emoji: '📡' },
  { id: 'EEE',   label: 'Electrical & Electronics Engineering',     emoji: '⚡' },
  { id: 'IT',    label: 'Information Technology',                   emoji: '🌐' },
  { id: 'MECH',  label: 'Mechanical Engineering',                   emoji: '⚙️' },
  { id: 'CIVIL', label: 'Civil Engineering',                        emoji: '🏗️' },
  { id: 'AIML',  label: 'Artificial Intelligence & Machine Learning', emoji: '🧠' },
];

// Seed default branches if collection is empty
const seedBranches = async () => {
  try {
    const count = await Branch.countDocuments();
    if (count === 0) {
      await Branch.insertMany(DEFAULT_BRANCHES);
      console.log('Default branches seeded');
    }
  } catch (err) {
    console.error('Branch seed error:', err.message);
  }
};

// GET /branches
const getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    res.json({ success: true, data: { branches } });
  } catch (err) { next(err); }
};

// GET /admin/branches (all including inactive)
const getAllBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ createdAt: 1 }).lean();
    res.json({ success: true, data: { branches } });
  } catch (err) { next(err); }
};

// POST /admin/branches
const createBranch = async (req, res, next) => {
  try {
    const { id, label, emoji = '📁' } = req.body;
    if (!id || !label) {
      return res.status(400).json({ success: false, message: 'id and label are required' });
    }
    const branch = await Branch.create({
      id:        id.toUpperCase().trim(),
      label:     label.trim(),
      emoji,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: { branch } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: `Branch "${req.body.id?.toUpperCase()}" already exists` });
    }
    next(err);
  }
};

// PATCH /admin/branches/:id — update label/emoji or toggle active
const updateBranch = async (req, res, next) => {
  try {
    const { label, emoji, isActive } = req.body;
    const update = {};
    if (label    !== undefined) update.label    = label.trim();
    if (emoji    !== undefined) update.emoji    = emoji;
    if (isActive !== undefined) update.isActive = isActive;

    const branch = await Branch.findOneAndUpdate({ id: req.params.id.toUpperCase() }, update, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: { branch } });
  } catch (err) { next(err); }
};

// DELETE /admin/branches/:id
const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findOneAndDelete({ id: req.params.id.toUpperCase() });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch deleted' });
  } catch (err) { next(err); }
};

module.exports = { getBranches, getAllBranches, createBranch, updateBranch, deleteBranch, seedBranches };
