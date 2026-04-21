import path from 'path';
import fs from 'fs';
import db from './sqlite';

/**
 * Reads schema.sql and executes it against the current DB connection.
 * All CREATE TABLE statements use IF NOT EXISTS, so this is safe to call
 * on every server start — it will only create tables that don't exist yet.
 */
export function runMigrations(): void {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('[DB] Migrations applied.');
}
