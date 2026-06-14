export interface BacktestRun {
  id?: number;
  user_id?: number | null;
  dataset_id: number;
  strategy_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  initial_capital: number;
  position_size: number;
  start_date?: number | null;
  end_date?: number | null;
  final_cash?: number | null;
  final_portfolio_value?: number | null;
  total_return_pct?: number | null;
  created_at?: string;
  completed_at?: string | null;
}

export interface BacktestRunInput {
  datasetId: number;
  userId: number;
  strategy: string;
  initialCapital: number;
  positionSize: number;
}
