import pool from '../db/postgres';
import { BacktestRun } from '../types/backtest';

export async function insertBacktestRun(
  run: Omit<BacktestRun, 'id' | 'created_at'>
): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO backtest_runs (dataset_id, strategy_name, status, initial_capital, position_size)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [run.dataset_id, run.strategy_name, run.status, run.initial_capital, run.position_size]
  );
  return rows[0].id;
}

export async function updateBacktestRunResult(
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
): Promise<void> {
  await pool.query(
    `UPDATE backtest_runs SET
       status                = $1,
       start_date            = $2,
       end_date              = $3,
       final_cash            = $4,
       final_portfolio_value = $5,
       total_return_pct      = $6,
       completed_at          = $7
     WHERE id = $8`,
    [
      data.status,
      data.start_date,
      data.end_date,
      data.final_cash,
      data.final_portfolio_value,
      data.total_return_pct,
      data.completed_at,
      id,
    ]
  );
}

export async function updateBacktestStatus(id: number, status: string): Promise<void> {
  await pool.query('UPDATE backtest_runs SET status = $1 WHERE id = $2', [status, id]);
}

export async function findAllBacktestRuns(): Promise<BacktestRun[]> {
  const { rows } = await pool.query<BacktestRun>(
    'SELECT * FROM backtest_runs ORDER BY created_at DESC'
  );
  return rows;
}

export async function findBacktestRunById(id: number): Promise<BacktestRun | undefined> {
  const { rows } = await pool.query<BacktestRun>(
    'SELECT * FROM backtest_runs WHERE id = $1',
    [id]
  );
  return rows[0];
}
