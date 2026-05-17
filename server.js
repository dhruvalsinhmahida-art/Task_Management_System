require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Import database initialization
const { initializeDatabase, getDb } = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const { setUserLocals } = require('./middleware/auth');

// Import models
const Task = require('./models/Task');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Make io available to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 }
}));

// Make user data available to all views
app.use(setUserLocals);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);

// Landing page
app.get('/', (req, res) => {
  res.render('index');
});

// Dashboard - FIXED version
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  console.log('Loading dashboard for user:', req.session.userId);

  try {
    const tasks = Task.findAll();
    console.log('Tasks loaded:', tasks.length);
    res.render('dashboard', { tasks, userRole: req.session.userRole });
  } catch (err) {
    console.error('Dashboard error:', err);
    // Send error details to browser for debugging
    res.status(500).send(`
      <h1>Error Loading Dashboard</h1>
      <p>Error: ${err.message}</p>
      <pre>${err.stack}</pre>
      <a href="/">Go Home</a>
    `);
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server after database is ready
async function startServer() {
  await initializeDatabase();
  console.log('✅ Database ready');

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:3000`);
    console.log('📝 Ready to accept connections');
  });
}

startServer();


const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});