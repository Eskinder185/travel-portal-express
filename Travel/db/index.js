const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'travlr.db'));
db.pragma('journal_mode = WAL');

// Itinerary table
db.exec(`
CREATE TABLE IF NOT EXISTS itineraries (
  code TEXT PRIMARY KEY,
  title TEXT,
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL
)`);

// Snapshots table (for readiness & other saved views)
db.exec(`
CREATE TABLE IF NOT EXISTS snapshots (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- 'readiness'
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL
)`);

module.exports = db;
