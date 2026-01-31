// src/config/db.js

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Absolute path to the database file
const DB_PATH = path.join(__dirname, "../../database/database.sqlite");

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite database:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to SQLite database");
});

// Always enable foreign keys
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

module.exports = db;
