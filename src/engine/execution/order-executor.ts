import { Portfolio } from '../../types/portfolio';
import { Trade } from '../../types/trade';
import { Signal } from '../strategy/momentum.strategy';
import { Candle } from '../../types/candle';
import { openPosition, closePosition } from './portfolio';

export interface ExecutionResult {
  portfolio: Portfolio;
  // null means no trade was executed (signal was ignored or HOLD)
  trade: Omit<Trade, 'id' | 'backtest_run_id'> | null;
}

/**
 * Try to execute a signal against the current portfolio.
 *
 * Rules:
 *  - BUY  → only if positionQty === 0 (no open position)
 *  - SELL → only if positionQty  > 0  (have an open position)
 *  - HOLD → do nothing
 *
 * Orders fill at the current candle's close price (no slippage, no fees).
 * `positionSize` is the fraction of available cash to spend on each BUY.
 */
export function executeSignal(
  signal: Signal,
  candle: Candle,
  portfolio: Portfolio,
  positionSize: number
): ExecutionResult {
  const price     = candle.close;
  const timestamp = candle.timestamp;

  if (signal === 'BUY' && portfolio.positionQty === 0) {
    const cashToSpend = portfolio.cash * positionSize;

    // Guard against edge-case of zero cash
    if (cashToSpend <= 0) {
      return { portfolio, trade: null };
    }

    const quantity       = cashToSpend / price;
    const updatedPortfolio = openPosition(portfolio, price, cashToSpend);

    return {
      portfolio: updatedPortfolio,
      trade: {
        timestamp,
        side:     'BUY',
        price,
        quantity,
        value:    cashToSpend,
        pnl:      0, // PnL is only realized when the position is closed
      },
    };
  }

  if (signal === 'SELL' && portfolio.positionQty > 0) {
    const quantity                   = portfolio.positionQty;
    const { updatedPortfolio, tradePnl } = closePosition(portfolio, price);
    const value                      = quantity * price;

    return {
      portfolio: updatedPortfolio,
      trade: {
        timestamp,
        side:  'SELL',
        price,
        quantity,
        value,
        pnl:   tradePnl,
      },
    };
  }

  // HOLD, or signal ignored because rules block it
  return { portfolio, trade: null };
}
