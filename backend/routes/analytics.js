const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Advanced analytics
router.get('/advanced', auth, async (req, res) => {
  try {
    const { timeRange = '6months' } = req.query;
    const userId = req.user.userId;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get activities in date range
    const activities = await Activity.find({
      student: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Calculate metrics
    const totalActivities = activities.length;
    const approvedActivities = activities.filter(a => a.status === 'approved').length;
    const growthRate = calculateGrowthRate(activities);
    const avgPerMonth = Math.round(totalActivities / getMonthsDiff(startDate, now));
    const successRate = totalActivities > 0 ? Math.round((approvedActivities / totalActivities) * 100) : 0;
    const goalProgress = Math.min(Math.round((approvedActivities / 12) * 100), 100); // Assuming 12 activities goal

    // Timeline data
    const timeline = generateTimeline(activities, startDate, now);
    
    // Category performance
    const categoryPerformance = generateCategoryPerformance(activities);
    
    // Credit distribution
    const creditDistribution = generateCreditDistribution(activities);

    res.json({
      growthRate,
      avgPerMonth,
      successRate,
      goalProgress,
      timeline,
      categoryPerformance,
      creditDistribution
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error generating analytics' });
  }
});

// Helper functions
function calculateGrowthRate(activities) {
  if (activities.length < 2) return 0;
  const firstHalf = activities.slice(0, Math.floor(activities.length / 2)).length;
  const secondHalf = activities.slice(Math.floor(activities.length / 2)).length;
  if (firstHalf === 0) return 100;
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
}

function getMonthsDiff(startDate, endDate) {
  return Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30)));
}

function generateTimeline(activities, startDate, endDate) {
  const timeline = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthActivities = activities.filter(a => {
      const actDate = new Date(a.createdAt);
      return actDate.getMonth() === current.getMonth() && 
             actDate.getFullYear() === current.getFullYear();
    }).length;
    
    timeline.push({
      month: current.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
      activities: monthActivities
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return timeline;
}

function generateCategoryPerformance(activities) {
  const categories = {};
  activities.forEach(activity => {
    if (!categories[activity.type]) {
      categories[activity.type] = { count: 0, credits: 0 };
    }
    categories[activity.type].count++;
    if (activity.status === 'approved') {
      categories[activity.type].credits += activity.credits || 0;
    }
  });
  
  return Object.entries(categories).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count: data.count,
    credits: data.credits
  }));
}

function generateCreditDistribution(activities) {
  const approved = activities.filter(a => a.status === 'approved');
  const distribution = {};
  
  approved.forEach(activity => {
    const type = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
    distribution[type] = (distribution[type] || 0) + (activity.credits || 0);
  });
  
  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
}

module.exports = router;
