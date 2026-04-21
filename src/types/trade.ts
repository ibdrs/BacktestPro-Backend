export interface Trade {
  id?: number;
  backtest_run_id: number;
  timestamp: number; // Unix ms of the candle on which the trade was executed
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  value: number;     // price * quantity
  pnl: number;       // realized pnl (only non-zero on SELL)
}
