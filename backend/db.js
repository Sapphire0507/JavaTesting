const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize 3 Database Entities/Models
// Entity 1: User
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Entity 2: Course
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL
  );
`);

// Entity 3: Feedback
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );
`);

// Seed default courses if table is empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM courses');
const { count } = countStmt.get();

if (count === 0) {
  const insertCourse = db.prepare('INSERT INTO courses (code, title, instructor) VALUES (?, ?, ?)');
  insertCourse.run('CS101', 'Introduction to Computer Science', 'Dr. Alan Turing');
  insertCourse.run('SE204', 'Software Engineering Principles', 'Prof. Margaret Hamilton');
  insertCourse.run('DB302', 'Database Systems & Architecture', 'Dr. Edgar Codd');
  insertCourse.run('WEB105', 'Modern Web Application Development', 'Prof. Tim Berners-Lee');
  console.log('Default courses seeded successfully.');
}

module.exports = db;

