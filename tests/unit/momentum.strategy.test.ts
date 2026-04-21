import { getMomentumSignal } from '../../src/engine/strategy/momentum.strategy';
import { Candle } from '../../src/types/candle';

// Helper to build a minimal candle with only the close price that matters
function makeCandle(close: number): Candle {
  return {
    id:         1,
    dataset_id: 1,
    timestamp:  1000,
    open:       close,
    high:       close + 1,
    low:        close - 1,
    close,
    volume:     1000,
  };
}

describe('getMomentumSignal', () => {
  it('returns BUY when current close > previous close', () => {
    expect(getMomentumSignal(makeCandle(110), makeCandle(100))).toBe('BUY');
  });

  it('returns SELL when current close < previous close', () => {
    expect(getMomentumSignal(makeCandle(90), makeCandle(100))).toBe('SELL');
  });

  it('returns HOLD when current close equals previous close', () => {
    expect(getMomentumSignal(makeCandle(100), makeCandle(100))).toBe('HOLD');
  });
});
