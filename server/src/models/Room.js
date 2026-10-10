const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectId: {
      type: String,
      default: null,
    },
    ownerId: {
      type: String,
      default: null,
    },
    roomName: {
      type: String,
      required: true,
      default: 'Collaborative Workspace',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    isGuestAllowed: {
      type: Boolean,
      default: true,
    },
    activeUsersCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
