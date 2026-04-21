// node:sqlite is built into Node.js 22+ — no installation needed.
// It has an API nearly identical to better-sqlite3 (synchronous, prepared statements).
// Node 22.5–22.13 requires --experimental-sqlite (added to npm scripts via NODE_OPTIONS).
// Node 22.14+ has it stable with no flag needed.
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || './data/backtest.db';

// For a real file-backed database, make sure the folder exists first
if (dbPath !== ':memory:') {
  const dir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db = new DatabaseSync(dbPath);

// WAL (Write-Ahead Logging) gives better concurrent read/write performance.
// Skipped for in-memory databases (used in tests) because WAL is not applicable there.
if (dbPath !== ':memory:') {
  db.exec("PRAGMA journal_mode = WAL");
}

// SQLite does not enforce foreign key constraints by default — enable them.
db.exec("PRAGMA foreign_keys = ON");

export default db;
