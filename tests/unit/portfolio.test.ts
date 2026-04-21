import {
  createPortfolio,
  openPosition,
  closePosition,
  getPortfolioValue,
} from '../../src/engine/execution/portfolio';

describe('createPortfolio', () => {
  it('starts with the given cash and zero position', () => {
    const p = createPortfolio(10000);
    expect(p.cash).toBe(10000);
    expect(p.positionQty).toBe(0);
    expect(p.entryPrice).toBe(0);
    expect(p.realizedPnl).toBe(0);
  });
});

describe('openPosition', () => {
  it('deducts the correct cash and sets quantity', () => {
    const p       = createPortfolio(10000);
    const updated = openPosition(p, 100, 1000); // buy 10 units at 100

    expect(updated.cash).toBe(9000);
    expect(updated.positionQty).toBeCloseTo(10);
    expect(updated.entryPrice).toBe(100);
    // realizedPnl is untouched on open
    expect(updated.realizedPnl).toBe(0);
  });
});

describe('closePosition', () => {
  it('books a profit correctly', () => {
    // 10 units bought at 100, sold at 120  →  +200 PnL
    const p = { cash: 9000, positionQty: 10, entryPrice: 100, realizedPnl: 0 };
    const { updatedPortfolio, tradePnl } = closePosition(p, 120);

    expect(tradePnl).toBeCloseTo(200);
    expect(updatedPortfolio.cash).toBeCloseTo(10200); // 9000 + (10 * 120)
    expect(updatedPortfolio.positionQty).toBe(0);
    expect(updatedPortfolio.entryPrice).toBe(0);
    expect(updatedPortfolio.realizedPnl).toBeCloseTo(200);
  });

  it('books a loss correctly', () => {
    // 10 units bought at 100, sold at 80  →  -200 PnL
    const p = { cash: 9000, positionQty: 10, entryPrice: 100, realizedPnl: 0 };
    const { updatedPortfolio, tradePnl } = closePosition(p, 80);

    expect(tradePnl).toBeCloseTo(-200);
    expect(updatedPortfolio.cash).toBeCloseTo(9800); // 9000 + (10 * 80)
    expect(updatedPortfolio.realizedPnl).toBeCloseTo(-200);
  });

  it('accumulates realized PnL across multiple trades', () => {
    const p1 = { cash: 9000, positionQty: 10, entryPrice: 100, realizedPnl: 50 };
    const { updatedPortfolio } = closePosition(p1, 120);
    expect(updatedPortfolio.realizedPnl).toBeCloseTo(250); // 50 + 200
  });
});

describe('getPortfolioValue', () => {
  it('returns cash + open position value', () => {
    const p = { cash: 9000, positionQty: 10, entryPrice: 100, realizedPnl: 0 };
    expect(getPortfolioValue(p, 120)).toBeCloseTo(10200);
  });

  it('returns just cash when there is no position', () => {
    const p = createPortfolio(10000);
    expect(getPortfolioValue(p, 999)).toBe(10000);
  });
});
