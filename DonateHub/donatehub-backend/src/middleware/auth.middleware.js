const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id. Access tokens are short-lived and not stored in the DB
    // only refresh tokens are persisted, so don't require token match here.
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Add user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = { auth, adminAuth };