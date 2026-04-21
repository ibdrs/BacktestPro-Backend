import * as datasetRepo  from '../repositories/dataset.repository';
import * as candleRepo   from '../repositories/candle.repository';
import * as backtestRepo from '../repositories/backtest.repository';
import * as tradeRepo    from '../repositories/trade.repository';
import { runBacktestEngine } from '../engine/backtest-engine';
import { BacktestRunInput } from '../types/backtest';

export async function runBacktest(input: BacktestRunInput) {
  const { datasetId, strategy, initialCapital, positionSize } = input;

  // Make sure the dataset exists before doing anything
  const dataset = datasetRepo.findDatasetById(datasetId);
  if (!dataset) {
    throw new Error(`Dataset with id ${datasetId} not found.`);
  }

  // Create the run record immediately so we have an ID
  const runId = backtestRepo.insertBacktestRun({
    dataset_id:    datasetId,
    strategy_name: strategy,
    status:        'running',
    initial_capital: initialCapital,
    position_size:   positionSize,
    start_date:      null,
    end_date:        null,
    final_cash:      null,
    final_portfolio_value: null,
    total_return_pct:      null,
    completed_at:          null,
  });

  try {
    const candles = candleRepo.findCandlesByDatasetId(datasetId);

    if (candles.length < 2) {
      throw new Error(
        `Dataset ${datasetId} has fewer than 2 candles — cannot run a backtest.`
      );
    }

    const result = runBacktestEngine(candles, initialCapital, positionSize, strategy);

    // Persist all trades
    if (result.trades.length > 0) {
      tradeRepo.insertTrades(
        result.trades.map((t) => ({ ...t, backtest_run_id: runId }))
      );
    }

    // Persist summary
    backtestRepo.updateBacktestRunResult(runId, {
      status:                'completed',
      start_date:            result.startDate,
      end_date:              result.endDate,
      final_cash:            result.finalPortfolio.cash,
      final_portfolio_value: result.finalPortfolioValue,
      total_return_pct:      result.totalReturnPct,
      completed_at:          new Date().toISOString(),
    });

    return getBacktestById(runId);
  } catch (err) {
    backtestRepo.updateBacktestStatus(runId, 'failed');
    throw err;
  }
}

export function getAllBacktests() {
  return backtestRepo.findAllBacktestRuns();
}

export function getBacktestById(id: number) {
  const run = backtestRepo.findBacktestRunById(id);
  if (!run) return null;

  const trades = tradeRepo.findTradesByBacktestRunId(id);
  return { ...run, trades };
}
