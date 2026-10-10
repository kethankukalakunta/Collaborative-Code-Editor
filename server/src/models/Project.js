const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'javascript',
  },
  path: {
    type: String,
    default: '/',
  },
  content: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    ownerId: {
      type: String,
      required: true,
    },
    collaborators: [
      {
        user: {
          type: String,
        },
        role: {
          type: String,
          enum: ['editor', 'viewer', 'admin'],
          default: 'editor',
        },
      },
    ],
    files: [fileSchema],
    activeRoomId: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
