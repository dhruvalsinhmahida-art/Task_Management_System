const { getDb, saveDatabase } = require('../database');

class Project {
  static create(name, description, createdBy) {
    try {
      const db = getDb();
      console.log('Creating project:', name);

      db.run(`INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)`,
        [name, description, createdBy]);
      saveDatabase();

      const result = db.exec(`SELECT last_insert_rowid() as id`);
      return result[0].values[0][0];
    } catch (err) {
      console.error('Project.create error:', err);
      throw err;
    }
  }

  static findAll() {
    try {
      const db = getDb();
      console.log('Project.findAll - executing query');

      const result = db.exec(`
        SELECT p.*, u.name as creator_name
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        ORDER BY p.created_at DESC
      `);

      if (result.length === 0) {
        return [];
      }

      const rows = result[0].values;
      const columns = result[0].columns;

      return rows.map(row => {
        const project = {};
        columns.forEach((col, idx) => {
          project[col] = row[idx];
        });
        return project;
      });
    } catch (err) {
      console.error('Project.findAll error:', err);
      return [];
    }
  }

  static findById(id) {
    try {
      const db = getDb();
      const result = db.exec(`SELECT * FROM projects WHERE id = ${id}`);

      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const row = result[0].values[0];
      const columns = result[0].columns;

      const project = {};
      columns.forEach((col, idx) => {
        project[col] = row[idx];
      });
      return project;
    } catch (err) {
      console.error('Project.findById error:', err);
      return null;
    }
  }

  static update(id, name, description) {
    try {
      const db = getDb();
      db.run(`UPDATE projects SET name = ?, description = ? WHERE id = ?`,
        [name, description, id]);
      saveDatabase();
      return true;
    } catch (err) {
      console.error('Project.update error:', err);
      throw err;
    }
  }

  static delete(id) {
    try {
      const db = getDb();
      db.run(`DELETE FROM tasks WHERE project_id = ${id}`);
      db.run(`DELETE FROM projects WHERE id = ${id}`);
      saveDatabase();
      return true;
    } catch (err) {
      console.error('Project.delete error:', err);
      throw err;
    }
  }
}

module.exports = Project;