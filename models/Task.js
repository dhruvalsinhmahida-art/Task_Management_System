const { getDb, saveDatabase } = require('../database');

class Task {
  static create(task) {
    try {
      const db = getDb();
      const { title, description, due_date, priority, status, project_id, created_by, assigned_to } = task;

      console.log('Creating task:', title);

      db.run(`
        INSERT INTO tasks (title, description, due_date, priority, status, project_id, created_by, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || '', due_date, priority, status, project_id || null, created_by, assigned_to]);

      saveDatabase();

      const result = db.exec(`SELECT last_insert_rowid() as id`);
      return result[0].values[0][0];
    } catch (err) {
      console.error('Task.create error:', err);
      throw err;
    }
  }

  static findAll() {
    try {
      const db = getDb();
      console.log('Task.findAll - executing query');

      const result = db.exec(`
        SELECT t.*,
               p.name as project_name,
               u.name as creator_name,
               assigned.name as assigned_to_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN users assigned ON t.assigned_to = assigned.id
        ORDER BY t.created_at DESC
      `);

      if (result.length === 0) {
        return [];
      }

      const rows = result[0].values;
      const columns = result[0].columns;

      return rows.map(row => {
        const task = {};
        columns.forEach((col, idx) => {
          task[col] = row[idx];
        });
        return task;
      });
    } catch (err) {
      console.error('Task.findAll error:', err);
      return [];
    }
  }

  static findById(id) {
    try {
      const db = getDb();
      const result = db.exec(`
        SELECT t.*, p.name as project_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ${id}
      `);

      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const row = result[0].values[0];
      const columns = result[0].columns;

      const task = {};
      columns.forEach((col, idx) => {
        task[col] = row[idx];
      });
      return task;
    } catch (err) {
      console.error('Task.findById error:', err);
      return null;
    }
  }

  static update(id, task) {
    try {
      const db = getDb();
      const { title, description, due_date, priority, status, project_id, assigned_to } = task;

      db.run(`
        UPDATE tasks
        SET title = ?, description = ?, due_date = ?, priority = ?,
            status = ?, project_id = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [title, description, due_date, priority, status, project_id || null, assigned_to, id]);

      saveDatabase();
      return true;
    } catch (err) {
      console.error('Task.update error:', err);
      throw err;
    }
  }

  static delete(id) {
    try {
      const db = getDb();
      db.run(`DELETE FROM tasks WHERE id = ${id}`);
      saveDatabase();
      return true;
    } catch (err) {
      console.error('Task.delete error:', err);
      throw err;
    }
  }

  static findByProject(projectId) {
    try {
      const db = getDb();
      const result = db.exec(`SELECT * FROM tasks WHERE project_id = ${projectId} ORDER BY due_date ASC`);

      if (result.length === 0) {
        return [];
      }

      const rows = result[0].values;
      const columns = result[0].columns;

      return rows.map(row => {
        const task = {};
        columns.forEach((col, idx) => {
          task[col] = row[idx];
        });
        return task;
      });
    } catch (err) {
      console.error('Task.findByProject error:', err);
      return [];
    }
  }
}

module.exports = Task;