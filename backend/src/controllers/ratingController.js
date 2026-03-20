'use strict';
const Rating = require('../models/Rating');
const File   = require('../models/File');

const getFileRatings = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const ratings = await Rating.find({ fileId }).populate('userId', 'name avatarUrl').sort({ createdAt: -1 }).lean();
    const avg = ratings.length ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1) : 0;
    const myRating = ratings.find(r => r.userId?._id?.toString() === req.user._id.toString());
    res.json({ success: true, data: { ratings, avg: parseFloat(avg), total: ratings.length, myRating: myRating || null } });
  } catch (err) { next(err); }
};

const rateFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { stars, comment = '' } = req.body;
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ success: false, message: 'stars must be 1-5' });
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    const rating = await Rating.findOneAndUpdate(
      { fileId, userId: req.user._id },
      { stars: parseInt(stars), comment, fileId, userId: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    const all = await Rating.find({ fileId });
    const avg = all.reduce((s, r) => s + r.stars, 0) / all.length;
    await File.findByIdAndUpdate(fileId, { avgRating: parseFloat(avg.toFixed(1)), ratingCount: all.length });
    res.json({ success: true, data: { rating } });
  } catch (err) { next(err); }
};

const deleteRating = async (req, res, next) => {
  try {
    await Rating.findOneAndDelete({ fileId: req.params.fileId, userId: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getFileRatings, rateFile, deleteRating };
