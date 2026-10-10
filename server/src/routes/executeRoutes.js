const express = require('express');
const { executeCode } = require('../controllers/executeController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, executeCode);

module.exports = router;
