import { validateCandleRow, parseTimestamp } from '../../src/validators/candle.validator';

// A baseline row that passes all validations
const validRow = {
  timestamp: '2023-01-01T00:00:00Z',
  open:   '100',
  high:   '110',
  low:    '90',
  close:  '105',
  volume: '1000',
};

describe('validateCandleRow', () => {
  it('accepts a fully valid row', () => {
    const result = validateCandleRow(validRow, 1);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a row with an empty required field', () => {
    const row = { ...validRow, close: '' };
    const result = validateCandleRow(row, 2);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('close'))).toBe(true);
  });

  it('rejects a row with a non-numeric price field', () => {
    const row = { ...validRow, open: 'abc' };
    const result = validateCandleRow(row, 3);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('open'))).toBe(true);
  });

  it('rejects a row where high < low', () => {
    const row = { ...validRow, high: '80', low: '90' };
    const result = validateCandleRow(row, 4);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('high'))).toBe(true);
  });

  it('accepts a row where high === low (valid flat candle)', () => {
    const row = { ...validRow, high: '100', low: '100', open: '100', close: '100' };
    const result = validateCandleRow(row, 5);
    expect(result.valid).toBe(true);
  });

  it('rejects a row with an invalid timestamp string', () => {
    const row = { ...validRow, timestamp: 'not-a-date' };
    const result = validateCandleRow(row, 6);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('timestamp'))).toBe(true);
  });

  it('rejects a row with a negative volume', () => {
    const row = { ...validRow, volume: '-5' };
    const result = validateCandleRow(row, 7);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('volume'))).toBe(true);
  });

  it('collects multiple errors in a single row', () => {
    const row = { ...validRow, open: 'abc', close: 'xyz' };
    const result = validateCandleRow(row, 8);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('parseTimestamp', () => {
  it('parses an ISO 8601 string', () => {
    const ts = parseTimestamp('2023-01-01T00:00:00Z');
    expect(ts).toBe(new Date('2023-01-01T00:00:00Z').getTime());
  });

  it('parses a Unix millisecond timestamp string', () => {
    expect(parseTimestamp('1672531200000')).toBe(1672531200000);
  });

  it('converts a Unix second timestamp to ms', () => {
    expect(parseTimestamp('1672531200')).toBe(1672531200000);
  });

  it('returns null for a garbage string', () => {
    expect(parseTimestamp('not-a-date')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseTimestamp('')).toBeNull();
  });
});
