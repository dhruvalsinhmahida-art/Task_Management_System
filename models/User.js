const { getDb, saveDatabase } = require('../database');
const bcrypt = require('bcryptjs');

class User {
  static create(name, email, password, role = 'user') {
    const db = getDb();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
    stmt.run([name, email, hashedPassword, role]);
    stmt.free();

    saveDatabase();

    // Get the last inserted ID
    const idStmt = db.prepare(`SELECT last_insert_rowid() as id`);
    const result = idStmt.get();
    idStmt.free();
    return result.id;
  }

  static findByEmail(email) {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
    const result = stmt.get([email]);
    stmt.free();
    return result;
  }

  static findById(id) {
    const db = getDb();
    const stmt = db.prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`);
    const result = stmt.get([id]);
    stmt.free();
    return result;
  }

  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  static getAllUsers() {
    const db = getDb();
    const stmt = db.prepare(`SELECT id, name, email, role FROM users`);
    const results = stmt.getAll();
    stmt.free();
    return results;
  }
}

module.exports = User;