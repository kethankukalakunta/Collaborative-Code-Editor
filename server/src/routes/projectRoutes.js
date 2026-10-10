const express = require('express');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getProjects);
router.post('/', authenticate, createProject);
router.get('/:id', optionalAuth, getProjectById);
router.patch('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

module.exports = router;
