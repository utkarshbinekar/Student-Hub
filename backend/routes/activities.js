const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Create uploads directory with absolute path
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory at:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Upload destination:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'certificate-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📎 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('📎 File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ File type allowed');
      return cb(null, true);
    } else {
      console.log('❌ File type not allowed:', file.mimetype);
      cb(new Error('Only PDF, PNG, JPG files are allowed'));
    }
  }
});

// ==================== ROUTES ====================

// Test route - NO AUTH NEEDED
router.get('/test', (req, res) => {
  console.log('✅ Activities test route hit');
  res.json({ 
    message: 'Activities route is working!', 
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir 
  });
});

// GET all activities
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching activities for user:', req.user.userId);
    console.log('👤 User role:', req.user.role);
    
    let query = {};
    
    // If not faculty/admin, only show user's activities
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      query.student = req.user.userId;
    }
    
    console.log('🔍 Query:', query);
    
    const activities = await Activity.find(query)
      .populate('student', 'name studentId department')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${activities.length} activities`);
    res.json(activities);
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    res.status(500).json({ 
      message: 'Server error fetching activities',
      error: error.message 
    });
  }
});

// GET user-specific activities
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('👤 Fetching activities for user:', userId);
    console.log('🔐 Requested by:', req.user.userId);
    console.log('👤 Requester role:', req.user.role);
    
    // Security check
    if (req.user.userId !== userId && req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('❌ Access denied for user:', req.user.userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Convert to ObjectId if needed
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      userObjectId = userId; // If it's already a string, use as-is
    }
    
    console.log('🔍 Searching for activities with student:', userObjectId);

    const activities = await Activity.find({ student: userObjectId })
      .populate('student', 'name studentId department')
      .sort({ createdAt: -1 });

    console.log(`👤 Found ${activities.length} activities for user ${userId}`);
    res.json(activities);
  } catch (error) {
    console.error('❌ Error fetching user activities:', error);
    res.status(500).json({ 
      message: 'Server error fetching user activities',
      error: error.message 
    });
  }
});

// GET analytics for user
router.get('/analytics/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📊 Fetching analytics for user:', userId);
    console.log('🔐 Requested by:', req.user.userId);
    
    // Security check
    if (req.user.userId !== userId && req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('❌ Access denied for analytics:', req.user.userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Convert to ObjectId if needed
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      userObjectId = userId;
    }

    console.log('📊 Calculating analytics for:', userObjectId);

    const totalActivities = await Activity.countDocuments({ student: userObjectId });
    const approvedActivities = await Activity.countDocuments({ student: userObjectId, status: 'approved' });
    const pendingActivities = await Activity.countDocuments({ student: userObjectId, status: 'pending' });
    const rejectedActivities = await Activity.countDocuments({ student: userObjectId, status: 'rejected' });
    
    // Calculate total credits from approved activities
    const creditResult = await Activity.aggregate([
      { $match: { student: userObjectId, status: 'approved' } },
      { $group: { _id: null, totalCredits: { $sum: '$credits' } } }
    ]);
    const totalCredits = creditResult.length > 0 ? creditResult[0].totalCredits : 0;

    // Get activity breakdown by type
    const activityByType = await Activity.aggregate([
      { $match: { student: userObjectId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const analytics = {
      totalActivities,
      approvedActivities,
      pendingActivities,
      rejectedActivities,
      totalCredits,
      activityByType
    };

    console.log('📊 Analytics result:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching analytics',
      error: error.message 
    });
  }
});

// POST new activity WITH FILE UPLOAD
router.post('/with-file', auth, upload.single('certificate'), async (req, res) => {
  try {
    console.log('➕ Creating activity with file upload');
    console.log('👤 User:', req.user);
    console.log('📝 Body:', req.body);
    console.log('📎 File info:', {
      filename: req.file?.filename,
      originalname: req.file?.originalname,
      path: req.file?.path,
      size: req.file?.size
    });
    
    const { title, type, description, date, organizer, duration } = req.body;
    
    if (!title || !type || !description || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'type', 'description', 'date']
      });
    }

    const activityData = {
      title,
      type,
      description,
      date: new Date(date),
      organizer: organizer || '',
      duration: duration || '',
      student: req.user.userId,
      status: 'pending',
      credits: 0
    };

    // Add certificate path if file was uploaded
    if (req.file) {
      // Store relative path for serving files
      activityData.certificate = `uploads/${req.file.filename}`;
      console.log('📎 Certificate path stored:', activityData.certificate);
      
      // Verify file actually exists
      const fullPath = path.join(__dirname, '..', activityData.certificate);
      if (fs.existsSync(fullPath)) {
        console.log('✅ File verified at:', fullPath);
      } else {
        console.log('❌ File not found at:', fullPath);
        throw new Error('File upload failed');
      }
    }

    const activity = new Activity(activityData);
    const savedActivity = await activity.save();
    
    await savedActivity.populate('student', 'name studentId department');
    
    console.log('✅ Activity with file created:', savedActivity._id);
    res.status(201).json(savedActivity);
    
  } catch (error) {
    console.error('❌ File upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Cleaned up uploaded file due to error');
    }
    
    res.status(500).json({ 
      message: 'Error creating activity with file',
      error: error.message
    });
  }
});

// POST new activity WITHOUT FILE UPLOAD
router.post('/', auth, async (req, res) => {
  try {
    console.log('➕ Creating new activity (no file)');
    console.log('👤 User:', req.user);
    console.log('📝 Data:', req.body);
    
    const { title, type, description, date, organizer, duration } = req.body;
    
    if (!title || !type || !description || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'type', 'description', 'date']
      });
    }

    const activityData = {
      title,
      type,
      description,
      date: new Date(date),
      organizer: organizer || '',
      duration: duration || '',
      student: req.user.userId,
      status: 'pending',
      credits: 0
    };

    const activity = new Activity(activityData);
    const savedActivity = await activity.save();
    
    await savedActivity.populate('student', 'name studentId department');
    
    console.log('✅ Activity created:', savedActivity._id);
    res.status(201).json(savedActivity);
    
  } catch (error) {
    console.error('❌ Activity creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating activity',
      error: error.message
    });
  }
});

// GET single activity by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Fetching activity:', id);
    
    const activity = await Activity.findById(id)
      .populate('student', 'name studentId department')
      .populate('approvedBy', 'name email');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Security check - users can only view their own activities (except faculty/admin)
    if (req.user.role !== 'faculty' && req.user.role !== 'admin' && 
        activity.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('📄 Activity found:', activity._id);
    res.json(activity);
  } catch (error) {
    console.error('❌ Error fetching activity:', error);
    res.status(500).json({ 
      message: 'Server error fetching activity',
      error: error.message 
    });
  }
});

// PATCH update activity status (faculty only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, credits } = req.body;
    
    console.log('🔄 Updating activity status:', { id, status, credits });
    console.log('👤 Updated by:', req.user);
    
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Faculty/Admin only.' });
    }

    const updateData = {
      status,
      approvedBy: req.user.userId
    };

    if (status === 'approved' && credits !== undefined) {
      updateData.credits = parseInt(credits) || 0;
    }

    console.log('💾 Update data:', updateData);

    const activity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('student', 'name studentId department')
     .populate('approvedBy', 'name email');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    console.log('✅ Activity status updated:', activity._id);
    res.json(activity);
  } catch (error) {
    console.error('❌ Update activity status error:', error);
    res.status(500).json({ 
      message: 'Server error updating activity status',
      error: error.message 
    });
  }
});

// DELETE activity (student can delete their own, faculty/admin can delete any)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting activity:', id);
    console.log('👤 Deleted by:', req.user);
    
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Security check
    if (req.user.role !== 'faculty' && req.user.role !== 'admin' && 
        activity.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated file if it exists
    if (activity.certificate) {
      const filePath = path.join(__dirname, '..', activity.certificate);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Deleted associated file:', filePath);
      }
    }

    await Activity.findByIdAndDelete(id);
    console.log('✅ Activity deleted:', id);
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('❌ Delete activity error:', error);
    res.status(500).json({ 
      message: 'Server error deleting activity',
      error: error.message 
    });
  }
});

module.exports = router;
