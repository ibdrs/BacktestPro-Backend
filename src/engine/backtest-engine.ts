import { Candle } from '../types/candle';
import { Trade } from '../types/trade';
import { Portfolio } from '../types/portfolio';
import { createPortfolio, getPortfolioValue } from './execution/portfolio';
import { getMomentumSignal } from './strategy/momentum.strategy';
import { executeSignal } from './execution/order-executor';

export interface EquityCurvePoint {
  timestamp: number;
  value: number;
}

export interface BacktestEngineResult {
  trades: Omit<Trade, 'id' | 'backtest_run_id'>[];
  finalPortfolio: Portfolio;
  finalPortfolioValue: number;
  startDate: number | null;
  endDate: number | null;
  totalReturnPct: number;
  equityCurve: EquityCurvePoint[];
}

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
  const equityCurve: EquityCurvePoint[] = [];

  equityCurve.push({ timestamp: candles[0].timestamp, value: initialCapital });

  for (let i = 1; i < candles.length; i++) {
    const current  = candles[i];
    const previous = candles[i - 1];

    let signal;
    if (strategyName === 'momentum') {
      signal = getMomentumSignal(current, previous);
    } else {
      throw new Error(`Unknown strategy: "${strategyName}"`);
    }

    const result = executeSignal(signal, current, portfolio, positionSize);
    portfolio = result.portfolio;

    if (result.trade) {
      trades.push(result.trade);
    }

    equityCurve.push({
      timestamp: current.timestamp,
      value: getPortfolioValue(portfolio, current.close),
    });
  }

  const lastCandle          = candles[candles.length - 1];
  const finalPortfolioValue = getPortfolioValue(portfolio, lastCandle.close);
  const totalReturnPct      = ((finalPortfolioValue - initialCapital) / initialCapital) * 100;

  return {
    trades,
    finalPortfolio: portfolio,
    finalPortfolioValue,
    startDate:   candles[0].timestamp,
    endDate:     lastCandle.timestamp,
    totalReturnPct,
    equityCurve,
  };
}
