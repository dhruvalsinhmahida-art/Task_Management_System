const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const bcrypt = require('bcryptjs');

// Register page
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null });
});

// Register handler
router.post('/register', (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.render('register', { error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters' });
  }

  try {
    const db = getDb();

    // Check if user exists
    const existing = db.exec(`SELECT * FROM users WHERE email = '${email}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.render('register', { error: 'Email already registered' });
    }

    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, 'user']);

    const { saveDatabase } = require('../database');
    saveDatabase();

    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

// Login handler - FIXED for sql.js
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email:', email);

  try {
    const db = getDb();

    // Query user from database
    const result = db.exec(`SELECT * FROM users WHERE email = '${email}'`);

    if (result.length === 0 || result[0].values.length === 0) {
      console.log('No user found with this email');
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Get the user data - sql.js returns array of values
    const userRow = result[0].values[0];
    const columns = result[0].columns;

    // Convert to object
    const user = {};
    columns.forEach((col, index) => {
      user[col] = userRow[index];
    });

    console.log('User found:', user.email, 'Role:', user.role);
    console.log('Stored hash:', user.password.substring(0, 30) + '...');

    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    console.log('Login successful! Redirecting to dashboard');
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;