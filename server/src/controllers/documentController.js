const DocumentState = require('../models/DocumentState');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const yjsManager = require('../yjs/yjsManager');

// Get document state snapshot
const getDocument = async (req, res, next) => {
  try {
    const { roomId, fileId = 'main' } = req.params;
    const docKey = `${roomId}:${fileId}`;

    // First check live in-memory Yjs doc
    const liveDoc = yjsManager.getDoc(docKey);
    let textContent = liveDoc ? liveDoc.getText('monaco').toString() : null;

    if (textContent === null) {
      if (getDBStatus()) {
        const doc = await DocumentState.findOne({ roomId, fileId });
        if (doc) {
          textContent = doc.textSnapshot || '';
        }
      } else {
        const doc = memoryStore.documents.get(docKey);
        if (doc) {
          textContent = doc.textSnapshot || '';
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        roomId,
        fileId,
        content: textContent || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Save document snapshot explicitly
const saveDocument = async (req, res, next) => {
  try {
    const { roomId, fileId = 'main' } = req.params;
    const { content, language, fileName } = req.body;
    const docKey = `${roomId}:${fileId}`;

    await yjsManager.persistDoc(docKey, content, fileName, language);

    res.status(200).json({
      success: true,
      message: 'Document saved successfully',
      data: { roomId, fileId, updatedAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocument,
  saveDocument,
};
