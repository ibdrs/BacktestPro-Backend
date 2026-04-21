import db from '../db/sqlite';
import { Trade } from '../types/trade';

export function insertTrades(trades: Omit<Trade, 'id'>[]): void {
  const stmt = db.prepare(`
    INSERT INTO trades (backtest_run_id, timestamp, side, price, quantity, value, pnl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const t of trades) {
      stmt.run(t.backtest_run_id, t.timestamp, t.side, t.price, t.quantity, t.value, t.pnl);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function findTradesByBacktestRunId(backtestRunId: number): Trade[] {
  return db
    .prepare(
      'SELECT * FROM trades WHERE backtest_run_id = ? ORDER BY timestamp ASC'
    )
    .all(backtestRunId) as unknown as Trade[];
}
