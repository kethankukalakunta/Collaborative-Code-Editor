const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

// List user projects
const getProjects = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);

    if (getDBStatus()) {
      const projects = await Project.find({
        $or: [{ ownerId: userId }, { 'collaborators.user': userId }, { isPublic: true }],
      }).sort({ updatedAt: -1 });

      return res.status(200).json({ success: true, data: projects });
    }

    // In-memory fallback
    const projects = Array.from(memoryStore.projects.values()).filter(
      (p) => p.ownerId === userId || p.isPublic
    );
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

// Create project
const createProject = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { name, description, language = 'javascript', isPublic = true } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const starterFileName = 
      language === 'python' ? 'main.py' :
      language === 'cpp' ? 'main.cpp' :
      language === 'java' ? 'Main.java' :
      language === 'html' ? 'index.html' : 'index.js';

    const defaultFiles = [
      {
        fileId: uuidv4(),
        name: starterFileName,
        language: language,
        path: '/',
        content: '',
        updatedAt: new Date(),
      },
    ];

    const roomId = `room-${uuidv4().substring(0, 8)}`;
    const Room = require('../models/Room');
    const DocumentState = require('../models/DocumentState');

    let project;
    if (getDBStatus()) {
      project = await Project.create({
        name,
        description,
        ownerId: userId,
        files: defaultFiles,
        activeRoomId: roomId,
        isPublic,
      });

      // Register Room
      await Room.create({
        roomId,
        projectId: project._id,
        ownerId: userId,
        roomName: name,
        visibility: isPublic ? 'public' : 'private',
        language,
        isGuestAllowed: true,
        activeUsersCount: 0,
      });

      // Seed DocumentState for primary files
      for (const f of defaultFiles) {
        await DocumentState.create({
          roomId,
          fileId: f.fileId,
          fileName: f.name,
          language: f.language,
          textSnapshot: f.content,
          version: 1,
        }).catch(() => {});
      }

      return res.status(201).json({ success: true, data: project });
    }

    // In-memory
    const projectId = uuidv4();
    project = {
      _id: projectId,
      id: projectId,
      name,
      description,
      ownerId: userId,
      files: defaultFiles,
      activeRoomId: roomId,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.projects.set(projectId, project);

    // Register room in memory
    memoryStore.rooms.set(roomId, {
      roomId,
      projectId,
      ownerId: userId,
      roomName: name,
      visibility: isPublic ? 'public' : 'private',
      language,
      isGuestAllowed: true,
      activeUsersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed document states in memory
    for (const f of defaultFiles) {
      memoryStore.documents.set(`${roomId}:${f.fileId}`, {
        roomId,
        fileId: f.fileId,
        fileName: f.name,
        language: f.language,
        textSnapshot: f.content,
        version: 1,
        updatedAt: new Date(),
      });
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Get single project
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const project = await Project.findById(id).populate('ownerId', 'username displayName avatar');
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      return res.status(200).json({ success: true, data: project });
    }

    const project = memoryStore.projects.get(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, files } = req.body;
    const userId = String(req.user._id || req.user.id);

    if (getDBStatus()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      if (project.ownerId.toString() !== userId.toString() && !req.user.isGuest) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
      }

      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      if (isPublic !== undefined) project.isPublic = isPublic;
      if (files) project.files = files;

      await project.save();
      return res.status(200).json({ success: true, data: project });
    }

    const project = memoryStore.projects.get(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (files) project.files = files;
    project.updatedAt = new Date();

    memoryStore.projects.set(id, project);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = String(req.user._id || req.user.id);

    if (getDBStatus()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      if (project.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
      }
      await project.deleteOne();
      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    }

    if (!memoryStore.projects.has(id)) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    memoryStore.projects.delete(id);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
