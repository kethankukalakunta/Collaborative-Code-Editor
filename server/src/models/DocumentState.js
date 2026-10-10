const mongoose = require('mongoose');

const documentStateSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    fileId: {
      type: String,
      required: true,
      default: 'main',
      index: true,
    },
    fileName: {
      type: String,
      default: 'main.js',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    encodedState: {
      type: String, // Base64 encoded Yjs update / document state
      default: '',
    },
    textSnapshot: {
      type: String, // Plain text preview of the document
      default: '',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

documentStateSchema.index({ roomId: 1, fileId: 1 }, { unique: true });

module.exports = mongoose.model('DocumentState', documentStateSchema);
