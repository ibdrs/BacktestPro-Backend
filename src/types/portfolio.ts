export interface Portfolio {
  cash: number;         // available cash
  positionQty: number;  // units of the asset currently held (0 = no position)
  entryPrice: number;   // price at which the current position was opened
  realizedPnl: number;  // cumulative realized profit/loss across all closed trades
}
