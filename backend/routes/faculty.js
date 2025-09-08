const express = require('express');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all students for faculty review (Faculty/Admin only)
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { department, year, search, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'student' };
    
    if (department) {
      query.department = department;
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalActivities = await Activity.countDocuments();
    const pendingActivities = await Activity.countDocuments({ status: 'pending' });
    const approvedActivities = await Activity.countDocuments({ status: 'approved' });
    const rejectedActivities = await Activity.countDocuments({ status: 'rejected' });

    // Department-wise statistics
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activities for review
    const recentActivities = await Activity.find({ status: 'pending' })
      .populate('student', 'name studentId department')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalStudents,
        totalActivities,
        pendingActivities,
        approvedActivities,
        rejectedActivities
      },
      departmentStats,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities pending approval (Faculty/Admin only)
router.get('/pending-activities', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 10, department, type } = req.query;
    
    let query = { status: 'pending' };
    
    const activities = await Activity.find(query)
      .populate('student', 'name studentId department year')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by department if specified
    const filteredActivities = department 
      ? activities.filter(activity => activity.student?.department === department)
      : activities;

    // Filter by type if specified
    const finalActivities = type 
      ? filteredActivities.filter(activity => activity.type === type)
      : filteredActivities;

    const total = await Activity.countDocuments(query);

    res.json({
      activities: finalActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalActivities: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk approve/reject activities (Faculty/Admin only)
router.patch('/bulk-action', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { activityIds, action, credits = 0 } = req.body;
    
    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ message: 'Activity IDs are required' });
    }

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const updateData = {
      status: action,
      approvedBy: req.user.userId
    };

    if (action === 'approved' && credits > 0) {
      updateData.credits = credits;
    }

    const result = await Activity.updateMany(
      { _id: { $in: activityIds } },
      updateData
    );

    res.json({
      message: `${action} ${result.modifiedCount} activities`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity reports for institution (Faculty/Admin only)
router.get('/reports', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate, department, type } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let matchQuery = { status: 'approved', ...dateQuery };
    
    const activities = await Activity.find(matchQuery)
      .populate('student', 'name studentId department year')
      .sort({ date: -1 });

    // Filter by department if specified
    const filteredActivities = department 
      ? activities.filter(activity => activity.student?.department === department)
      : activities;

    // Filter by type if specified
    const finalActivities = type 
      ? filteredActivities.filter(activity => activity.type === type)
      : filteredActivities;

    // Generate report statistics
    const reportStats = {
      totalActivities: finalActivities.length,
      totalCredits: finalActivities.reduce((sum, activity) => sum + (activity.credits || 0), 0),
      byType: {},
      byDepartment: {},
      byMonth: {}
    };

    finalActivities.forEach(activity => {
      // By type
      reportStats.byType[activity.type] = (reportStats.byType[activity.type] || 0) + 1;
      
      // By department
      const dept = activity.student?.department || 'Unknown';
      reportStats.byDepartment[dept] = (reportStats.byDepartment[dept] || 0) + 1;
      
      // By month
      const month = new Date(activity.date).toISOString().substring(0, 7);
      reportStats.byMonth[month] = (reportStats.byMonth[month] || 0) + 1;
    });

    res.json({
      activities: finalActivities,
      stats: reportStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
