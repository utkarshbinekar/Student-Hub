const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('relatedActivity', 'title type')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Create notification (internal function)
async function createNotification(recipient, title, message, type, relatedActivity = null) {
  try {
    const notification = new Notification({
      recipient,
      title,
      message,
      type,
      relatedActivity
    });
    await notification.save();
    console.log('📧 Notification created:', title);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
}

module.exports = { router, createNotification };
