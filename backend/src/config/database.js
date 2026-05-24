const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DATABASE_PATH || './swimdata.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Athletes table
    db.run(`
      CREATE TABLE IF NOT EXISTS athletes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
        club_name TEXT,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Swim times table
    db.run(`
      CREATE TABLE IF NOT EXISTS swim_times (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        athlete_id INTEGER NOT NULL,
        distance INTEGER NOT NULL,
        stroke TEXT NOT NULL,
        time_seconds REAL NOT NULL,
        recorded_date DATE NOT NULL,
        competition_name TEXT,
        is_personal_best BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
      )
    `);

    // Benchmarks table
    db.run(`
      CREATE TABLE IF NOT EXISTS benchmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age_group TEXT NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
        distance INTEGER NOT NULL,
        stroke TEXT NOT NULL,
        bronze_time_seconds REAL,
        silver_time_seconds REAL,
        gold_time_seconds REAL,
        elite_time_seconds REAL,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(age_group, gender, distance, stroke)
      )
    `);

    // Check if benchmarks are already loaded
    db.get('SELECT COUNT(*) as count FROM benchmarks', (err, row) => {
      if (row && row.count === 0) {
        loadBenchmarks();
      }
    });
  });
}

// Load sample benchmark data
function loadBenchmarks() {
  const benchmarks = [
    // 12-13 year old Males
    ['12-13', 'M', 50, 'Freestyle', 31.50, 29.00, 27.00, 25.50, 'FINA'],
    ['12-13', 'M', 100, 'Freestyle', 66.00, 62.00, 57.50, 54.00, 'FINA'],
    ['12-13', 'M', 200, 'Freestyle', 141.00, 131.00, 121.00, 112.00, 'FINA'],
    ['12-13', 'M', 400, 'Freestyle', 291.00, 270.00, 249.00, 230.00, 'FINA'],
    ['12-13', 'M', 100, 'Backstroke', 71.00, 67.00, 62.00, 58.00, 'FINA'],
    ['12-13', 'M', 100, 'Breaststroke', 81.00, 76.00, 70.00, 65.00, 'FINA'],
    ['12-13', 'M', 100, 'Butterfly', 73.00, 68.00, 62.00, 57.00, 'FINA'],
    ['12-13', 'M', 200, 'Individual Medley', 151.00, 140.00, 129.00, 118.00, 'FINA'],
    // 12-13 year old Females
    ['12-13', 'F', 50, 'Freestyle', 33.00, 30.50, 28.50, 26.50, 'FINA'],
    ['12-13', 'F', 100, 'Freestyle', 70.00, 65.00, 61.00, 57.00, 'FINA'],
    ['12-13', 'F', 200, 'Freestyle', 149.00, 138.00, 128.00, 118.00, 'FINA'],
    ['12-13', 'F', 400, 'Freestyle', 308.00, 286.00, 264.00, 243.00, 'FINA'],
    ['12-13', 'F', 100, 'Backstroke', 75.00, 71.00, 66.00, 61.00, 'FINA'],
    ['12-13', 'F', 100, 'Breaststroke', 86.00, 81.00, 75.00, 69.00, 'FINA'],
    ['12-13', 'F', 100, 'Butterfly', 78.00, 73.00, 68.00, 62.00, 'FINA'],
    ['12-13', 'F', 200, 'Individual Medley', 161.00, 150.00, 138.00, 127.00, 'FINA'],
    // 14-15 year old Males
    ['14-15', 'M', 50, 'Freestyle', 28.50, 26.50, 24.50, 23.00, 'FINA'],
    ['14-15', 'M', 100, 'Freestyle', 60.00, 56.00, 52.00, 48.50, 'FINA'],
    ['14-15', 'M', 200, 'Freestyle', 128.00, 118.00, 108.00, 98.00, 'FINA'],
    ['14-15', 'M', 400, 'Freestyle', 266.00, 245.00, 225.00, 205.00, 'FINA'],
    // 14-15 year old Females
    ['14-15', 'F', 50, 'Freestyle', 30.00, 28.00, 26.00, 24.00, 'FINA'],
    ['14-15', 'F', 100, 'Freestyle', 64.00, 59.50, 55.00, 51.00, 'FINA'],
    ['14-15', 'F', 200, 'Freestyle', 136.00, 126.00, 115.00, 105.00, 'FINA'],
    ['14-15', 'F', 400, 'Freestyle', 282.00, 261.00, 240.00, 219.00, 'FINA'],
  ];

  const stmt = db.prepare(`
    INSERT INTO benchmarks (age_group, gender, distance, stroke, bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  benchmarks.forEach(benchmark => {
    stmt.run(benchmark);
  });

  stmt.finalize();
  console.log('Benchmarks loaded successfully');
}

module.exports = db;
