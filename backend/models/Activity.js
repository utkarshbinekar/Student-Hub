const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['conference', 'workshop', 'certification', 'competition', 'internship', 'volunteer', 'leadership', 'community'],
    required: true 
  },
  description: { type: String, required: true },
  organizer: { type: String },
  date: { type: Date, required: true },
  duration: { type: String },
  certificate: { type: String }, // File path
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
