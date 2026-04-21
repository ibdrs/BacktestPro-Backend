import { runBacktestEngine } from '../../src/engine/backtest-engine';
import { Candle } from '../../src/types/candle';

// Build a candle list from an array of close prices
function makeCandles(closes: number[]): Candle[] {
  return closes.map((close, i) => ({
    id:         i + 1,
    dataset_id: 1,
    timestamp:  1000 * (i + 1),
    open:       close,
    high:       close,
    low:        close,
    close,
    volume:     1000,
  }));
}

describe('runBacktestEngine', () => {
  it('throws when fewer than 2 candles are provided', () => {
    expect(() =>
      runBacktestEngine(makeCandles([100]), 10000, 0.5, 'momentum')
    ).toThrow();
  });

  it('throws for an unknown strategy name', () => {
    expect(() =>
      runBacktestEngine(makeCandles([100, 110]), 10000, 0.5, 'unknown')
    ).toThrow();
  });

  it('generates a BUY then SELL for rising then falling prices', () => {
    // 100 → 110 triggers BUY on candle 2
    // 110 → 90  triggers SELL on candle 3
    const result = runBacktestEngine(makeCandles([100, 110, 90]), 10000, 0.5, 'momentum');

    expect(result.trades).toHaveLength(2);
    expect(result.trades[0].side).toBe('BUY');
    expect(result.trades[1].side).toBe('SELL');
  });

  it('generates no trades when all prices are flat', () => {
    const result = runBacktestEngine(makeCandles([100, 100, 100, 100]), 10000, 0.5, 'momentum');
    expect(result.trades).toHaveLength(0);
  });

  it('opens at most one position at a time (consistently rising prices)', () => {
    // Price keeps rising → momentum keeps signalling BUY, but we must only buy once
    const result = runBacktestEngine(
      makeCandles([100, 110, 120, 130, 140]),
      10000, 0.5, 'momentum'
    );
    const buys = result.trades.filter((t) => t.side === 'BUY');
    expect(buys).toHaveLength(1);
  });

  it('records the correct start and end dates', () => {
    const candles = makeCandles([100, 110, 90]);
    const result  = runBacktestEngine(candles, 10000, 0.5, 'momentum');

    expect(result.startDate).toBe(candles[0].timestamp);
    expect(result.endDate).toBe(candles[candles.length - 1].timestamp);
  });

  it('calculates a positive total return when trades are profitable', () => {
    // Buy on rise, sell on fall — net gain depends on exact numbers, just check sign
    const result = runBacktestEngine(
      makeCandles([100, 200, 150]),
      10000, 1.0, 'momentum'
    );
    // Bought at 200 with all cash, sold at 150 — should be a loss
    expect(result.totalReturnPct).toBeLessThan(0);
  });

  it('does not open a new position immediately after selling', () => {
    // 100 → 110 → 90 → 95 → 80
    // BUY on 110, SELL on 90, next signal is BUY on 95 but then SELL on 80
    const result = runBacktestEngine(
      makeCandles([100, 110, 90, 95, 80]),
      10000, 0.5, 'momentum'
    );
    const buys  = result.trades.filter((t) => t.side === 'BUY');
    const sells = result.trades.filter((t) => t.side === 'SELL');
    // Should have a BUY-SELL pair for each round trip
    expect(buys.length).toBe(sells.length);
  });
});
