const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// View all projects
router.get('/', isAuthenticated, (req, res) => {
  try {
    console.log('Loading projects page');
    const projects = Project.findAll();
    console.log('Projects found:', projects.length);
    res.render('projects', { projects, userRole: req.session.userRole });
  } catch (err) {
    console.error('Projects page error:', err);
    res.status(500).send('Error loading projects: ' + err.message);
  }
});

// Add project form (Admin only)
router.get('/add', isAuthenticated, isAdmin, (req, res) => {
  res.render('add-project', { error: null });
});

// Add project handler (Admin only)
router.post('/add', isAuthenticated, isAdmin, (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.render('add-project', { error: 'Project name is required' });
  }

  try {
    Project.create(name, description || '', req.session.userId);
    res.redirect('/projects');
  } catch (err) {
    console.error('Add project error:', err);
    res.render('add-project', { error: 'Failed to create project: ' + err.message });
  }
});

// Delete project (Admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    Project.delete(parseInt(req.params.id));
    res.redirect('/projects');
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).send('Failed to delete project: ' + err.message);
  }
});

// View tasks in a project
router.get('/:id/tasks', isAuthenticated, (req, res) => {
  try {
    const project = Project.findById(parseInt(req.params.id));
    if (!project) {
      return res.status(404).send('Project not found');
    }
    const tasks = Task.findByProject(parseInt(req.params.id));
    res.render('project-tasks', { project, tasks });
  } catch (err) {
    console.error('Project tasks error:', err);
    res.status(500).send('Error loading project tasks: ' + err.message);
  }
});

module.exports = router;