const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const DocumentState = require('../models/DocumentState');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

// Create a collaboration room
const createRoom = async (req, res, next) => {
  try {
    const { roomName, language = 'javascript', visibility = 'public', projectId } = req.body;
    const userId = req.user ? String(req.user._id || req.user.id) : null;
    const roomId = `room-${uuidv4().substring(0, 8)}`;

    const roomData = {
      roomId,
      projectId: projectId || null,
      ownerId: userId,
      roomName: roomName || `Collaboration Session #${roomId.slice(-4)}`,
      visibility,
      language,
      isGuestAllowed: true,
      activeUsersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (getDBStatus()) {
      const room = await Room.create(roomData);
      return res.status(201).json({ success: true, data: room });
    }

    memoryStore.rooms.set(roomId, roomData);
    res.status(201).json({ success: true, data: roomData });
  } catch (error) {
    next(error);
  }
};

// Get room by ID (validate room access & attach project files)
const getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const Project = require('../models/Project');

    let room = null;
    let project = null;

    if (getDBStatus()) {
      room = await Room.findOne({ roomId }).populate('ownerId', 'username displayName avatar');
      if (room && room.projectId) {
        project = await Project.findById(room.projectId);
      }
      if (!project) {
        project = await Project.findOne({ activeRoomId: roomId });
      }
    } else {
      room = memoryStore.rooms.get(roomId);
      if (room && room.projectId) {
        project = memoryStore.projects.get(room.projectId.toString());
      }
      if (!project) {
        for (const p of memoryStore.projects.values()) {
          if (p.activeRoomId === roomId || p._id === roomId || p.id === roomId) {
            project = p;
            break;
          }
        }
      }
    }

    if (!room) {
      // Auto-provision demo / join-by-link room if requested
      const newRoom = {
        roomId,
        roomName: project ? project.name : `Room ${roomId}`,
        projectId: project ? (project._id || project.id) : null,
        visibility: 'public',
        language: project?.files?.[0]?.language || 'javascript',
        isGuestAllowed: true,
        activeUsersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (getDBStatus()) {
        try {
          room = await Room.create(newRoom);
        } catch (e) {
          room = newRoom;
        }
      } else {
        memoryStore.rooms.set(roomId, newRoom);
        room = newRoom;
      }
    }

    const roomObj = room.toObject ? room.toObject() : { ...room };
    if (project) {
      roomObj.roomName = project.name;
      roomObj.language = project.files?.[0]?.language || roomObj.language;
      roomObj.files = project.files;
    }

    res.status(200).json({ success: true, data: roomObj });
  } catch (error) {
    next(error);
  }
};

// List active or recent rooms
const getRecentRooms = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const rooms = await Room.find({ visibility: 'public' }).sort({ lastActivity: -1 }).limit(10);
      return res.status(200).json({ success: true, data: rooms });
    }

    const rooms = Array.from(memoryStore.rooms.values()).filter((r) => r.visibility === 'public');
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoomById,
  getRecentRooms,
};
