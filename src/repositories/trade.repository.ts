import pool from '../db/postgres';
import { Trade } from '../types/trade';

export async function insertTrades(trades: Omit<Trade, 'id'>[]): Promise<void> {
  if (trades.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const t of trades) {
      await client.query(
        `INSERT INTO trades (backtest_run_id, timestamp, side, price, quantity, value, pnl)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [t.backtest_run_id, t.timestamp, t.side, t.price, t.quantity, t.value, t.pnl]
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

export async function findTradesByBacktestRunId(backtestRunId: number): Promise<Trade[]> {
  const { rows } = await pool.query<Trade>(
    'SELECT * FROM trades WHERE backtest_run_id = $1 ORDER BY timestamp ASC',
    [backtestRunId]
  );
  return rows;
}
