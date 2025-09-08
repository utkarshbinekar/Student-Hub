const express = require('express');
const multer = require('multer');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get student activities
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'student' 
      ? { student: req.user.userId }
      : {};
    
    const activities = await Activity.find(query)
      .populate('student', 'name studentId department year')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new activity
router.post('/', auth, upload.single('certificate'), async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      student: req.user.userId,
      certificate: req.file ? req.file.path : null
    };

    const activity = new Activity(activityData);
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('student', 'name studentId department year');
    
    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject activity (Faculty only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, credits } = req.body;
    
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        credits: status === 'approved' ? credits || 0 : 0,
        approvedBy: req.user.userId 
      },
      { new: true }
    ).populate('student', 'name studentId department year');

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalActivities = await Activity.countDocuments();
    const approvedActivities = await Activity.countDocuments({ status: 'approved' });
    const pendingActivities = await Activity.countDocuments({ status: 'pending' });
    
    const activityByType = await Activity.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      totalActivities,
      approvedActivities,
      pendingActivities,
      activityByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
