const { initializeDatabase, getDb } = require('./database');

async function checkDatabase() {
  try {
    await initializeDatabase();
    const db = getDb();

    // Get all users - using exec for sql.js
    const result = db.exec(`SELECT id, name, email, role, password FROM users`);

    if (result.length > 0) {
      console.log('Users in database:');
      console.log(result[0].values);
      console.log('\nColumns:', result[0].columns);
    } else {
      console.log('No users found in database.');
      console.log('Run: npm run init-db');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkDatabase();