import { Candle } from '../types/candle';
import { Trade } from '../types/trade';
import { Portfolio } from '../types/portfolio';
import { createPortfolio, getPortfolioValue } from './execution/portfolio';
import { getMomentumSignal } from './strategy/momentum.strategy';
import { executeSignal } from './execution/order-executor';

export interface BacktestEngineResult {
  trades: Omit<Trade, 'id' | 'backtest_run_id'>[];
  finalPortfolio: Portfolio;
  finalPortfolioValue: number;
  startDate: number | null;
  endDate: number | null;
  totalReturnPct: number;
}

/**
 * Core backtest loop:
 *
 * Iterates through candles in chronological order (index 1 onward, because we
 * need a "previous" candle to generate a signal). For each candle:
 *   1. Ask the strategy for a signal.
 *   2. Pass the signal to the order executor.
 *   3. Update the portfolio.
 */
export function runBacktestEngine(
  candles: Candle[],
  initialCapital: number,
  positionSize: number,
  strategyName: string
): BacktestEngineResult {
  if (candles.length < 2) {
    throw new Error('Need at least 2 candles to run a backtest.');
  }

  let portfolio = createPortfolio(initialCapital);
  const trades: Omit<Trade, 'id' | 'backtest_run_id'>[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current  = candles[i];
    const previous = candles[i - 1];

    // Signal generation
    let signal;
    if (strategyName === 'momentum') {
      signal = getMomentumSignal(current, previous);
    } else {
      throw new Error(`Unknown strategy: "${strategyName}"`);
    }

    // Order execution
    const result = executeSignal(signal, current, portfolio, positionSize);
    portfolio = result.portfolio;

    if (result.trade) {
      trades.push(result.trade);
    }
  }

  const lastCandle         = candles[candles.length - 1];
  const finalPortfolioValue = getPortfolioValue(portfolio, lastCandle.close);
  const totalReturnPct      = ((finalPortfolioValue - initialCapital) / initialCapital) * 100;

  return {
    trades,
    finalPortfolio:      portfolio,
    finalPortfolioValue,
    startDate:           candles[0].timestamp,
    endDate:             lastCandle.timestamp,
    totalReturnPct,
  };
}
