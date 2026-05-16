const { initializeDatabase, getDb, saveDatabase } = require('./database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('=== DATABASE INITIALIZATION ===');

  await initializeDatabase();
  const db = getDb();

  // Clear existing data
  console.log('Clearing existing data...');
  db.run(`DELETE FROM tasks`);
  db.run(`DELETE FROM projects`);
  db.run(`DELETE FROM users`);
  db.run(`DELETE FROM sqlite_sequence`);

  // Hash passwords - UPDATED with your credentials
  const adminPassword = bcrypt.hashSync('Dhruval@19', 10);  // Changed
  const userPassword = bcrypt.hashSync('user123', 10);

  // Insert admin user - UPDATED with your email
  console.log('Creating admin user...');
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Administrator', 'dhruvalsinhmahida@gmail.com', adminPassword, 'admin']);  // Email changed

  // Insert demo user
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Demo User', 'user@example.com', userPassword, 'user']);

  // Insert projects
  console.log('Creating projects...');
  db.run(`INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)`,
    ['Website Redesign', 'Redesign company website with modern UX', 1]);
  db.run(`INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)`,
    ['Mobile App Development', 'Create cross-platform mobile app', 1]);

  // Insert tasks
  console.log('Creating tasks...');
  db.run(`INSERT INTO tasks (title, description, due_date, priority, status, project_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Design homepage mockup', 'Create Figma designs for homepage', '2026-06-15', 'high', 'pending', 1, 1]);
  db.run(`INSERT INTO tasks (title, description, due_date, priority, status, project_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Setup database schema', 'Design and implement database', '2026-06-10', 'medium', 'in_progress', 2, 1]);

  // Save database
  saveDatabase();

  console.log('');
  console.log('🎉 Database initialized successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Login Credentials:');
  console.log('   Admin: dhruvalsinhmahida@gmail.com / Dhruval@19');  // Updated
  console.log('   User:  user@example.com / user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Verify
  const result = db.exec(`SELECT id, name, email, role FROM users`);
  if (result.length > 0) {
    console.log('\n✅ Users in database:', result[0].values.length);
  }
}

initDatabase().catch(console.error);