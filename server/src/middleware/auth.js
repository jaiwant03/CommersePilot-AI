const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User.model');
const Store = require('../models/Store.model');

/**
 * Middleware to authenticate requests via secure HTTP-only cookies or Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && (req.cookies.token || req.cookies.cp_jwt)) {
      token = req.cookies.token || req.cookies.cp_jwt;
    } 
    // 2. Fall back to Authorization: Bearer <token>
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user and populate store
    const user = await User.findById(decoded.id).populate('store');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session token no longer exists.'
      });
    }

    // Attach to request
    req.user = user;
    req.store = user.store;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session token. Authentication failed.'
    });
  }
};

module.exports = {
  authenticate
};
