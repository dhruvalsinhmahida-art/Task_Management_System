const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// View all tasks (redirects to dashboard)
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

// Add task form
router.get('/add', isAuthenticated, (req, res) => {
  try {
    console.log('Loading add task form');
    const projects = Project.findAll();
    console.log('Projects loaded:', projects.length);
    res.render('add-task', { projects, error: null });
  } catch (err) {
    console.error('Add task form error:', err);
    res.status(500).send('Error loading form: ' + err.message);
  }
});

// Add task handler
router.post('/add', isAuthenticated, (req, res) => {
  const { title, description, due_date, priority, status, project_id } = req.body;

  console.log('Adding task:', title);

  if (!title || !due_date) {
    try {
      const projects = Project.findAll();
      return res.render('add-task', { projects, error: 'Title and due date are required' });
    } catch (err) {
      return res.status(500).send('Error: ' + err.message);
    }
  }

  try {
    const task = {
      title,
      description: description || '',
      due_date,
      priority: priority || 'medium',
      status: status || 'pending',
      project_id: project_id || null,
      created_by: req.session.userId,
      assigned_to: req.session.userId
    };

    Task.create(task);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('task-notification', { message: `New task "${title}" created` });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Add task error:', err);
    try {
      const projects = Project.findAll();
      res.render('add-task', { projects, error: 'Failed to create task: ' + err.message });
    } catch (e) {
      res.status(500).send('Failed to create task: ' + err.message);
    }
  }
});

// Edit task form (Admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    console.log('Loading edit task form for id:', req.params.id);
    const task = Task.findById(parseInt(req.params.id));
    if (!task) {
      return res.status(404).send('Task not found');
    }
    const projects = Project.findAll();
    res.render('edit-task', { task, projects, error: null });
  } catch (err) {
    console.error('Edit task form error:', err);
    res.status(500).send('Error loading task: ' + err.message);
  }
});

// Edit task handler (Admin only)
router.post('/edit/:id', isAuthenticated, isAdmin, (req, res) => {
  const { title, description, due_date, priority, status, project_id } = req.body;

  try {
    const task = {
      title,
      description: description || '',
      due_date,
      priority: priority || 'medium',
      status: status || 'pending',
      project_id: project_id || null,
      assigned_to: req.session.userId
    };

    Task.update(parseInt(req.params.id), task);

    const io = req.app.get('io');
    io.emit('task-notification', { message: `Task "${title}" updated` });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Edit task error:', err);
    res.status(500).send('Failed to update task: ' + err.message);
  }
});

// Delete task (Admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    Task.delete(parseInt(req.params.id));
    const io = req.app.get('io');
    io.emit('task-notification', { message: `Task deleted` });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).send('Failed to delete task: ' + err.message);
  }
});

module.exports = router;