import { executeSignal } from '../../src/engine/execution/order-executor';
import { createPortfolio } from '../../src/engine/execution/portfolio';
import { Candle } from '../../src/types/candle';

function makeCandle(close: number, timestamp = 1000): Candle {
  return {
    id: 1, dataset_id: 1, timestamp, open: close, high: close, low: close, close, volume: 1000,
  };
}

describe('executeSignal — BUY', () => {
  it('opens a position when none exists', () => {
    const portfolio = createPortfolio(10000);
    const result    = executeSignal('BUY', makeCandle(100), portfolio, 0.5);

    expect(result.trade).not.toBeNull();
    expect(result.trade!.side).toBe('BUY');
    expect(result.trade!.price).toBe(100);
    expect(result.portfolio.cash).toBeCloseTo(5000);        // 50% spent
    expect(result.portfolio.positionQty).toBeCloseTo(50);   // 5000 / 100
    expect(result.trade!.pnl).toBe(0); // PnL is only on SELL
  });

  it('ignores BUY when a position is already open', () => {
    const portfolio = { cash: 5000, positionQty: 50, entryPrice: 100, realizedPnl: 0 };
    const result    = executeSignal('BUY', makeCandle(110), portfolio, 0.5);

    expect(result.trade).toBeNull();
    expect(result.portfolio).toEqual(portfolio); // unchanged
  });

  it('does nothing when there is no cash left', () => {
    const portfolio = createPortfolio(0);
    const result    = executeSignal('BUY', makeCandle(100), portfolio, 0.5);
    expect(result.trade).toBeNull();
  });
});

describe('executeSignal — SELL', () => {
  it('closes a position and records PnL', () => {
    const portfolio = { cash: 5000, positionQty: 50, entryPrice: 100, realizedPnl: 0 };
    const result    = executeSignal('SELL', makeCandle(110), portfolio, 0.5);

    expect(result.trade).not.toBeNull();
    expect(result.trade!.side).toBe('SELL');
    expect(result.trade!.pnl).toBeCloseTo(500); // 50 * (110 - 100)
    expect(result.portfolio.positionQty).toBe(0);
    expect(result.portfolio.cash).toBeCloseTo(10500); // 5000 + 50*110
  });

  it('ignores SELL when no position is open', () => {
    const portfolio = createPortfolio(10000);
    const result    = executeSignal('SELL', makeCandle(90), portfolio, 0.5);

    expect(result.trade).toBeNull();
    expect(result.portfolio).toEqual(portfolio);
  });
});

describe('executeSignal — HOLD', () => {
  it('makes no changes', () => {
    const portfolio = createPortfolio(10000);
    const result    = executeSignal('HOLD', makeCandle(100), portfolio, 0.5);

    expect(result.trade).toBeNull();
    expect(result.portfolio).toEqual(portfolio);
  });
});
