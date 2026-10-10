const express = require('express');
const { createRoom, getRoomById, getRecentRooms } = require('../controllers/roomController');
const { getDocument, saveDocument } = require('../controllers/documentController');
const { optionalAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getRecentRooms);
router.post('/', optionalAuth, createRoom);
router.get('/:roomId', optionalAuth, getRoomById);
router.get('/:roomId/documents/:fileId', optionalAuth, getDocument);
router.put('/:roomId/documents/:fileId', optionalAuth, saveDocument);

module.exports = router;
