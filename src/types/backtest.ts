export interface BacktestRun {
  id?: number;
  dataset_id: number;
  strategy_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  initial_capital: number;
  position_size: number;
  start_date?: number | null;   // Unix ms of first candle
  end_date?: number | null;     // Unix ms of last candle
  final_cash?: number | null;
  final_portfolio_value?: number | null;
  total_return_pct?: number | null;
  created_at?: string;
  completed_at?: string | null;
}

// Shape of the request body for POST /api/backtests
export interface BacktestRunInput {
  datasetId: number;
  strategy: string;
  initialCapital: number;
  positionSize: number;
}
