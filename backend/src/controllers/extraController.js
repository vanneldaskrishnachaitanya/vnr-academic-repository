'use strict';
const File            = require('../models/File');
const User            = require('../models/User');
const DownloadHistory = require('../models/DownloadHistory');

// Download history
const getDownloadHistory = async (req, res, next) => {
  try {
    const history = await DownloadHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: { history } });
  } catch (err) { next(err); }
};

const recordDownload = async (userId, file) => {
  try {
    await DownloadHistory.create({ userId, fileId: file._id, regulation: file.regulation, branch: file.branch, subject: file.subject, fileName: file.originalName });
  } catch {}
};

// Global search
const globalSearch = async (req, res, next) => {
  try {
    const { q, regulation, branch, category, examType, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    const filter = {
      status: 'approved',
      $or: [
        { originalName: { $regex: q.trim(), $options: 'i' } },
        { subject:      { $regex: q.trim(), $options: 'i' } },
        { branch:       { $regex: q.trim(), $options: 'i' } },
      ],
    };
    if (regulation) filter.regulation = regulation.toUpperCase();
    if (branch)     filter.branch     = branch.toUpperCase();
    if (category)   filter.category   = category;
    if (examType)   filter.examType   = examType;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const [files, total] = await Promise.all([
      File.find(filter).populate('uploadedBy', 'name email').sort({ downloadCount: -1, uploadedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      File.countDocuments(filter),
    ]);
    res.json({ success: true, data: { files, total, page: pageNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

// User management
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

module.exports = { getDownloadHistory, recordDownload, globalSearch, getAllUsers, toggleUserActive };
