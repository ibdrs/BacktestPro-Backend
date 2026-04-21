import db from '../db/sqlite';
import { BacktestRun } from '../types/backtest';

export function insertBacktestRun(
  run: Omit<BacktestRun, 'id' | 'created_at'>
): number {
  const stmt = db.prepare(`
    INSERT INTO backtest_runs (dataset_id, strategy_name, status, initial_capital, position_size)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    run.dataset_id,
    run.strategy_name,
    run.status,
    run.initial_capital,
    run.position_size
  );
  return result.lastInsertRowid as number;
}

export function updateBacktestRunResult(
  id: number,
  data: {
    status: string;
    start_date: number | null;
    end_date: number | null;
    final_cash: number;
    final_portfolio_value: number;
    total_return_pct: number;
    completed_at: string;
  }
): void {
  db.prepare(`
    UPDATE backtest_runs SET
      status                = ?,
      start_date            = ?,
      end_date              = ?,
      final_cash            = ?,
      final_portfolio_value = ?,
      total_return_pct      = ?,
      completed_at          = ?
    WHERE id = ?
  `).run(
    data.status,
    data.start_date,
    data.end_date,
    data.final_cash,
    data.final_portfolio_value,
    data.total_return_pct,
    data.completed_at,
    id
  );
}

export function updateBacktestStatus(id: number, status: string): void {
  db.prepare('UPDATE backtest_runs SET status = ? WHERE id = ?').run(status, id);
}

export function findAllBacktestRuns(): BacktestRun[] {
  return db
    .prepare('SELECT * FROM backtest_runs ORDER BY created_at DESC')
    .all() as unknown as BacktestRun[];
}

export function findBacktestRunById(id: number): BacktestRun | undefined {
  return db
    .prepare('SELECT * FROM backtest_runs WHERE id = ?')
    .get(id) as unknown as BacktestRun | undefined;
}
