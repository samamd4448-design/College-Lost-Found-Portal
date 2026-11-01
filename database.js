const Database = require("better-sqlite3");

// Create database
const db = new Database("lostfound.db");

// Create items table
db.exec(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT,
        location TEXT,
        item_date TEXT,
        description TEXT,
        type TEXT NOT NULL
    )
`);

console.log("Database connected successfully!");

module.exports = db;