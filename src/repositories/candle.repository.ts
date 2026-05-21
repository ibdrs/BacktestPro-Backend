import pool from '../db/postgres';
import { Candle } from '../types/candle';

export async function insertCandles(candles: Omit<Candle, 'id'>[]): Promise<void> {
  if (candles.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const c of candles) {
      await client.query(
        `INSERT INTO candles (dataset_id, timestamp, open, high, low, close, volume)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.dataset_id, c.timestamp, c.open, c.high, c.low, c.close, c.volume]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findCandlesByDatasetId(datasetId: number): Promise<Candle[]> {
  const { rows } = await pool.query<Candle>(
    'SELECT * FROM candles WHERE dataset_id = $1 ORDER BY timestamp ASC',
    [datasetId]
  );
  return rows;
}

export async function countCandlesByDatasetId(datasetId: number): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM candles WHERE dataset_id = $1',
    [datasetId]
  );
  return Number(rows[0].count);
}
