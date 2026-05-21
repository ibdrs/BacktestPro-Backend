import path from 'path';
import fs from 'fs';
import pool from './postgres';

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schema);
  console.log('[DB] Migrations applied.');
}
