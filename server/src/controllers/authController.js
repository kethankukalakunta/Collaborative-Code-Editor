const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_987654321';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const collaboratorColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6',
  '#f97316', '#6366f1', '#84cc16', '#eab308'
];

const getRandomColor = () => {
  return collaboratorColors[Math.floor(Math.random() * collaboratorColors.length)];
};

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { username, displayName, email, password } = req.body;

    if (!username || !displayName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userColor = getRandomColor();
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    let user;
    if (getDBStatus()) {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
      }

      user = await User.create({
        username,
        displayName,
        email,
        passwordHash,
        avatar,
        color: userColor,
        isGuest: false,
      });
    } else {
      // In-memory fallback
      for (const u of memoryStore.users.values()) {
        if (u.email === email || u.username === username) {
          return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
        }
      }
      const id = uuidv4();
      user = {
        _id: id,
        id,
        username,
        displayName,
        email,
        passwordHash,
        avatar,
        color: userColor,
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(id, user);
    }

    const token = generateToken({
      id: user._id || user.id,
      username: user.username,
      displayName: user.displayName,
      isGuest: false,
      color: user.color,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user._id || user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          color: user.color,
          isGuest: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login existing user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let user;
    if (getDBStatus()) {
      user = await User.findOne({ email });
    } else {
      for (const u of memoryStore.users.values()) {
        if (u.email === email) {
          user = u;
          break;
        }
      }
    }

    if (!user || user.isGuest) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user._id || user.id,
      username: user.username,
      displayName: user.displayName,
      isGuest: false,
      color: user.color,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id || user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          color: user.color,
          isGuest: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create guest / anonymous session
const createGuestSession = async (req, res, next) => {
  try {
    const guestName = req.body.displayName?.trim() || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
    const guestId = `guest_${uuidv4().substring(0, 8)}`;
    const userColor = getRandomColor();
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(guestId)}`;

    const guestUser = {
      id: guestId,
      _id: guestId,
      username: guestId,
      displayName: guestName,
      email: `${guestId}@guest.local`,
      isGuest: true,
      color: userColor,
      avatar,
      createdAt: new Date(),
    };

    memoryStore.users.set(guestId, guestUser);

    const token = generateToken({
      id: guestId,
      username: guestId,
      displayName: guestName,
      isGuest: true,
      color: userColor,
    });

    res.status(200).json({
      success: true,
      message: 'Guest session created',
      data: {
        token,
        user: guestUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current profile
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  createGuestSession,
  getMe,
};
