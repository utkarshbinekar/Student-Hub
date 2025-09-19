const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware started');
    console.log('🔐 Headers:', Object.keys(req.headers));
    
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'Not found');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    console.log('🔐 Token extracted:', token.substring(0, 20) + '...');
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Token decoded:', { userId: decoded.userId, email: decoded.email });
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    console.log('✅ Auth successful for:', req.user.name);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
