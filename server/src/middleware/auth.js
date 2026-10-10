const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_987654321';

// Protect routes that require authenticated or registered users
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(decoded.id);

    if (getDBStatus() && isValidObjectId) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else if (!isValidObjectId) {
      // Guest user with string ID — skip DB lookup
      user = memoryStore.users.get(decoded.id) || null;
    } else {
      user = memoryStore.users.get(decoded.id);
    }

    if (!user) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        username: decoded.username || `user_${String(decoded.id).slice(0, 6)}`,
        displayName: decoded.displayName || decoded.username || 'Collaborator',
        isGuest: decoded.isGuest ?? true,
        color: decoded.color || '#3b82f6',
        avatar: decoded.avatar || '',
      };
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or has expired', error: error.message });
  }
};

// Optional auth: parse user if token is attached, otherwise allow guest/anonymous
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const mongoose = require('mongoose');
      const isValidObjectId = mongoose.Types.ObjectId.isValid(decoded.id);
      let user = null;
      if (getDBStatus() && isValidObjectId) {
        user = await User.findById(decoded.id).select('-passwordHash');
      } else {
        user = memoryStore.users.get(decoded.id) || null;
      }
      if (user) {
        req.user = user;
      } else if (decoded.isGuest) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          username: decoded.username,
          displayName: decoded.displayName || decoded.username,
          isGuest: true,
          color: decoded.color || '#3b82f6',
        };
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuth };
