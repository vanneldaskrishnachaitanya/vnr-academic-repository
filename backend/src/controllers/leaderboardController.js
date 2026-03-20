'use strict';
const File            = require('../models/File');
const User            = require('../models/User');
const DownloadHistory = require('../models/DownloadHistory');
const Folder          = require('../models/Folder');

// GET /leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    // Top uploaders — count approved files per user
    const topUploaders = await File.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$uploadedBy', uploadCount: { $sum: 1 } } },
      { $sort:  { uploadCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { uploadCount: 1, name: '$user.name', email: '$user.email', avatarUrl: '$user.avatarUrl' } },
    ]);

    // Most downloaded files
    const topDownloaded = await File.find({ status: 'approved', downloadCount: { $gt: 0 } })
      .sort({ downloadCount: -1 })
      .limit(10)
      .select('originalName regulation branch subject downloadCount')
      .lean();

    res.json({ success: true, data: { topUploaders, topDownloaded } });
  } catch (err) { next(err); }
};

// GET /upload-progress?regulation=R22&branch=CSE
const getUploadProgress = async (req, res, next) => {
  try {
    const { regulation = 'R22', branch = 'CSE' } = req.query;

    // Get all folders for this regulation+branch
    const folders = await Folder.find({
      regulation: regulation.toUpperCase(),
      branch:     branch.toUpperCase(),
    }).lean();

    const progress = await Promise.all(folders.map(async (folder) => {
      const [mid1, mid2, semester] = await Promise.all([
        File.exists({ folder: folder._id, examType: 'mid1',    status: 'approved' }),
        File.exists({ folder: folder._id, examType: 'mid2',    status: 'approved' }),
        File.exists({ folder: folder._id, examType: 'semester',status: 'approved' }),
      ]);
      return {
        subject:  folder.subject,
        year:     folder.year,
        sem:      folder.sem,
        mid1:     !!mid1,
        mid2:     !!mid2,
        semester: !!semester,
      };
    }));

    res.json({ success: true, data: { progress } });
  } catch (err) { next(err); }
};

// ── CSV Export helpers ────────────────────────────────────────
const toCSV = (rows, cols) => {
  const header = cols.join(',');
  const body   = rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','));
  return [header, ...body].join('\n');
};

// GET /admin/export/files
const exportFiles = async (req, res, next) => {
  try {
    const files = await File.find().populate('uploadedBy', 'name email').lean();
    const rows  = files.map(f => ({
      id:          f._id,
      name:        f.originalName,
      regulation:  f.regulation,
      branch:      f.branch,
      subject:     f.subject,
      category:    f.category,
      examType:    f.examType || '',
      status:      f.status,
      downloads:   f.downloadCount || 0,
      uploadedBy:  f.uploadedBy?.name || '',
      email:       f.uploadedBy?.email || '',
      uploadedAt:  f.createdAt?.toISOString().slice(0,10) || '',
    }));
    const csv = toCSV(rows, ['id','name','regulation','branch','subject','category','examType','status','downloads','uploadedBy','email','uploadedAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="files.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

// GET /admin/export/users
const exportUsers = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    const rows  = users.map(u => ({
      id:       u._id,
      name:     u.name,
      email:    u.email,
      role:     u.role,
      active:   u.isActive ? 'yes' : 'no',
      joined:   u.createdAt?.toISOString().slice(0,10) || '',
    }));
    const csv = toCSV(rows, ['id','name','email','role','active','joined']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

// GET /admin/export/downloads
const exportDownloads = async (req, res, next) => {
  try {
    const hist = await DownloadHistory.find()
      .populate('user', 'name email')
      .populate('file', 'originalName regulation branch subject')
      .lean();
    const rows = hist.map(h => ({
      user:       h.user?.name || '',
      email:      h.user?.email || '',
      file:       h.file?.originalName || '',
      regulation: h.file?.regulation || '',
      branch:     h.file?.branch || '',
      subject:    h.file?.subject || '',
      date:       h.createdAt?.toISOString().slice(0,10) || '',
    }));
    const csv = toCSV(rows, ['user','email','file','regulation','branch','subject','date']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="downloads.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

module.exports = { getLeaderboard, getUploadProgress, exportFiles, exportUsers, exportDownloads };
