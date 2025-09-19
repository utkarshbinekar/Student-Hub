const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with correct path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Serving static files from:', path.join(__dirname, 'uploads'));

// Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Student Hub API is running!',
    uploadsPath: path.join(__dirname, 'uploads')
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-hub';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📁 Uploads directory:', path.join(__dirname, 'uploads'));
});

module.exports = app;
