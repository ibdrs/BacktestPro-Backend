import path from 'path';
import fs from 'fs';
import pool from './postgres';

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schema);

  // Additive column migrations — safe to run on existing tables
  await pool.query(`
    ALTER TABLE backtest_runs
    ADD COLUMN IF NOT EXISTS equity_curve JSONB
  `);

  await pool.query(`
    ALTER TABLE backtest_runs
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `);

  console.log('[DB] Migrations applied.');
}
