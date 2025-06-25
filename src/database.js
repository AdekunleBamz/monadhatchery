const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the backend directory
const dbPath = path.join(__dirname, '..', 'monad-hatchery.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          address TEXT UNIQUE NOT NULL,
          points INTEGER DEFAULT 0,
          progress INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Monanimals table
      db.run(`
        CREATE TABLE IF NOT EXISTS monanimals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_id INTEGER UNIQUE NOT NULL,
          owner TEXT NOT NULL,
          name TEXT NOT NULL,
          traits TEXT NOT NULL,
          lore TEXT NOT NULL,
          evolution_stage INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User Monanimals relationship table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_monanimals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_address TEXT NOT NULL,
          token_id INTEGER NOT NULL,
          FOREIGN KEY (user_address) REFERENCES users (address),
          FOREIGN KEY (token_id) REFERENCES monanimals (token_id),
          UNIQUE(user_address, token_id)
        )
      `);

      // User Lore Cards relationship table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_lore_cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_address TEXT NOT NULL,
          card_id INTEGER NOT NULL,
          FOREIGN KEY (user_address) REFERENCES users (address),
          UNIQUE(user_address, card_id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

module.exports = { db, initializeDatabase }; 