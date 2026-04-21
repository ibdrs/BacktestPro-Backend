import { Candle } from '../../types/candle';

export type Signal = 'BUY' | 'SELL' | 'HOLD';

/**
 * Simple momentum strategy:
 *   current close > previous close  →  BUY
 *   current close < previous close  →  SELL
 *   current close = previous close  →  HOLD
 */
export function getMomentumSignal(current: Candle, previous: Candle): Signal {
  if (current.close > previous.close) return 'BUY';
  if (current.close < previous.close) return 'SELL';
  return 'HOLD';
}
