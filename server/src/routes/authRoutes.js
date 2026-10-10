const express = require('express');
const { register, login, createGuestSession, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuestSession);
router.get('/me', authenticate, getMe);

module.exports = router;
