const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-hub');
    
    // Clear existing users (optional)
    await User.deleteMany({});
    
    // Create demo users
    const demoUsers = [
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'password',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        year: 3
      },
      {
        name: 'Demo Faculty',
        email: 'faculty@demo.com',
        password: 'password',
        role: 'faculty',
        department: 'Computer Science'
      },
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password',
        role: 'admin',
        department: 'Administration'
      }
    ];

    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Demo users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
