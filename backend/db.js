const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'interview_scheduling.db');
const db = new sqlite3.Database(dbPath);

// Promisify db methods
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initDb = async () => {
  // Users table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT CHECK(role IN ('panelist', 'candidate', 'admin')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Panelist availability table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS panelist_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      panelist_id INTEGER NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      interview_type TEXT NOT NULL,
      max_daily_interviews INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (panelist_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Candidate availability table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS candidate_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      preferred_type TEXT,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Interviews table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      panelist_id INTEGER NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      round_details TEXT,
      meeting_link TEXT,
      status TEXT DEFAULT 'Scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES users(id),
      FOREIGN KEY (panelist_id) REFERENCES users(id)
    )
  `);

  // Interview status logs
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS interview_status_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interview_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
    )
  `);

  // Insert default admin if not exists
  const admin = await db.getAsync(`SELECT * FROM users WHERE email = 'admin@example.com'`);
  if (!admin) {
    await db.runAsync(`
      INSERT INTO users (name, email, role)
      VALUES ('Admin', 'admin@example.com', 'admin')
    `);
  }

  console.log('Database initialized successfully');
};

module.exports = initDb;
module.exports.db = db;