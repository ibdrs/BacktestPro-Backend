import db from '../db/sqlite';
import { Candle } from '../types/candle';

// Insert all the candles in one transaction
export function insertCandles(candles: Omit<Candle, 'id'>[]): void {
  const stmt = db.prepare(`
    INSERT INTO candles (dataset_id, timestamp, open, high, low, close, volume)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const c of candles) {
      stmt.run(c.dataset_id, c.timestamp, c.open, c.high, c.low, c.close, c.volume);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function findCandlesByDatasetId(datasetId: number): Candle[] {
  return db
    .prepare('SELECT * FROM candles WHERE dataset_id = ? ORDER BY timestamp ASC')
    .all(datasetId) as unknown as Candle[];
}

export function countCandlesByDatasetId(datasetId: number): number {
  const row = db
    .prepare('SELECT COUNT(*) as count FROM candles WHERE dataset_id = ?')
    .get(datasetId) as unknown as { count: number };
  return row.count;
}
