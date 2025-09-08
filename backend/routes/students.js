const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const router = express.Router();

// Get student profile (separate routes for optional parameter)
router.get('/profile', auth, async (req, res) => {
  try {
    const studentId = req.user.userId;
    
    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student activities
    const activities = await Activity.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalActivities = activities.length;
    const approvedActivities = activities.filter(a => a.status === 'approved').length;
    const pendingActivities = activities.filter(a => a.status === 'pending').length;
    const totalCredits = activities
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + (a.credits || 0), 0);

    // Activity breakdown by type
    const activityByType = {};
    activities.forEach(activity => {
      activityByType[activity.type] = (activityByType[activity.type] || 0) + 1;
    });

    res.json({
      student,
      statistics: {
        totalActivities,
        approvedActivities,
        pendingActivities,
        totalCredits,
        activityByType
      },
      recentActivities: activities.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific student profile by ID (Faculty/Admin only)
router.get('/profile/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.params.id;
    
    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student activities
    const activities = await Activity.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalActivities = activities.length;
    const approvedActivities = activities.filter(a => a.status === 'approved').length;
    const pendingActivities = activities.filter(a => a.status === 'pending').length;
    const totalCredits = activities
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + (a.credits || 0), 0);

    // Activity breakdown by type
    const activityByType = {};
    activities.forEach(activity => {
      activityByType[activity.type] = (activityByType[activity.type] || 0) + 1;
    });

    res.json({
      student,
      statistics: {
        totalActivities,
        approvedActivities,
        pendingActivities,
        totalCredits,
        activityByType
      },
      recentActivities: activities.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, department, year } = req.body;
    
    const updatedStudent = await User.findByIdAndUpdate(
      req.user.userId,
      { name, department, year },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students (Faculty/Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { department, year, search, page = 1, limit = 10 } = req.query;
    
    // Build query
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

    // Pagination
    const skip = (page - 1) * limit;
    
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get activity counts for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const activityCount = await Activity.countDocuments({ student: student._id });
        const approvedCount = await Activity.countDocuments({ 
          student: student._id, 
          status: 'approved' 
        });
        const totalCredits = await Activity.aggregate([
          { $match: { student: student._id, status: 'approved' } },
          { $group: { _id: null, total: { $sum: '$credits' } } }
        ]);

        return {
          ...student.toObject(),
          stats: {
            totalActivities: activityCount,
            approvedActivities: approvedCount,
            totalCredits: totalCredits[0]?.total || 0
          }
        };
      })
    );

    res.json({
      students: studentsWithStats,
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

// Get student dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get student's activities
    const activities = await Activity.find({ student: req.user.userId })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      approvedActivities: activities.filter(a => a.status === 'approved').length,
      pendingActivities: activities.filter(a => a.status === 'pending').length,
      rejectedActivities: activities.filter(a => a.status === 'rejected').length,
      totalCredits: activities
        .filter(a => a.status === 'approved')
        .reduce((sum, a) => sum + (a.credits || 0), 0)
    };

    // Activity breakdown by type
    const activityByType = {};
    activities.forEach(activity => {
      activityByType[activity.type] = (activityByType[activity.type] || 0) + 1;
    });

    // Recent activities
    const recentActivities = activities.slice(0, 5);

    res.json({
      stats,
      activityByType: Object.entries(activityByType).map(([type, count]) => ({
        type,
        count
      })),
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate student portfolio/report
router.get('/portfolio', auth, async (req, res) => {
  try {
    const studentId = req.user.userId;
    
    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const activities = await Activity.find({ 
      student: studentId,
      status: 'approved' 
    }).sort({ date: -1 });

    // Group activities by type
    const portfolioData = {
      student: {
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        email: student.email
      },
      summary: {
        totalActivities: activities.length,
        totalCredits: activities.reduce((sum, a) => sum + (a.credits || 0), 0),
        activitiesByType: {}
      },
      activities: {}
    };

    // Organize activities by type
    activities.forEach(activity => {
      if (!portfolioData.activities[activity.type]) {
        portfolioData.activities[activity.type] = [];
        portfolioData.summary.activitiesByType[activity.type] = 0;
      }
      portfolioData.activities[activity.type].push({
        title: activity.title,
        description: activity.description,
        organizer: activity.organizer,
        date: activity.date,
        duration: activity.duration,
        credits: activity.credits
      });
      portfolioData.summary.activitiesByType[activity.type]++;
    });

    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate specific student portfolio (Faculty/Admin only)
router.get('/portfolio/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.params.id;
    
    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const activities = await Activity.find({ 
      student: studentId,
      status: 'approved' 
    }).sort({ date: -1 });

    // Group activities by type
    const portfolioData = {
      student: {
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        email: student.email
      },
      summary: {
        totalActivities: activities.length,
        totalCredits: activities.reduce((sum, a) => sum + (a.credits || 0), 0),
        activitiesByType: {}
      },
      activities: {}
    };

    // Organize activities by type
    activities.forEach(activity => {
      if (!portfolioData.activities[activity.type]) {
        portfolioData.activities[activity.type] = [];
        portfolioData.summary.activitiesByType[activity.type] = 0;
      }
      portfolioData.activities[activity.type].push({
        title: activity.title,
        description: activity.description,
        organizer: activity.organizer,
        date: activity.date,
        duration: activity.duration,
        credits: activity.credits
      });
      portfolioData.summary.activitiesByType[activity.type]++;
    });

    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { department, limit = 10 } = req.query;
    
    let matchQuery = { role: 'student' };
    if (department) {
      matchQuery.department = department;
    }

    const leaderboard = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'activities',
          localField: '_id',
          foreignField: 'student',
          as: 'activities'
        }
      },
      {
        $addFields: {
          totalCredits: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$activities',
                    cond: { $eq: ['$$this.status', 'approved'] }
                  }
                },
                as: 'activity',
                in: { $ifNull: ['$$activity.credits', 0] }
              }
            }
          },
          totalActivities: { $size: '$activities' },
          approvedActivities: {
            $size: {
              $filter: {
                input: '$activities',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          studentId: 1,
          department: 1,
          year: 1,
          totalCredits: 1,
          totalActivities: 1,
          approvedActivities: 1
        }
      },
      { $sort: { totalCredits: -1, approvedActivities: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated activities
    await Activity.deleteMany({ student: req.params.id });
    
    // Delete student
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
