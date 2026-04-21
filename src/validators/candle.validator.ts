import { RawCandleRow } from '../types/candle';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a single raw CSV row.
 * All values arrive as strings from the CSV parser, so we parse and
 * check each one explicitly.
 */
export function validateCandleRow(row: RawCandleRow, rowIndex: number): ValidationResult {
  const errors: string[] = [];
  const prefix = `Row ${rowIndex}`;

  // 1. Check every required field is present and non-empty
  const requiredFields: (keyof RawCandleRow)[] = [
    'timestamp', 'open', 'high', 'low', 'close', 'volume',
  ];
  for (const field of requiredFields) {
    const val = row[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.push(`${prefix}: missing required field "${field}"`);
    }
  }

  // Stop early — further checks don't make sense with missing fields
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 2. Validate numeric price/volume fields
  const numericFields: (keyof RawCandleRow)[] = ['open', 'high', 'low', 'close', 'volume'];
  const parsed: Partial<Record<keyof RawCandleRow, number>> = {};

  for (const field of numericFields) {
    const value = Number(row[field]);
    if (isNaN(value)) {
      errors.push(`${prefix}: "${field}" must be a number, got "${row[field]}"`);
    } else if (value < 0) {
      errors.push(`${prefix}: "${field}" must be >= 0, got ${value}`);
    } else {
      parsed[field] = value;
    }
  }

  // 3. Validate timestamp (ISO string or Unix seconds/ms)
  const ts = parseTimestamp(row.timestamp);
  if (ts === null) {
    errors.push(`${prefix}: invalid timestamp "${row.timestamp}"`);
  }

  // 4. Validate OHLC logic — high must be >= low
  if (parsed.high !== undefined && parsed.low !== undefined) {
    if (parsed.high < parsed.low) {
      errors.push(
        `${prefix}: high (${parsed.high}) must be >= low (${parsed.low})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parse a timestamp value from a CSV cell.
 * Accepts:
 *   - ISO 8601 strings  e.g. "2023-01-01T00:00:00Z"
 *   - Unix milliseconds e.g. "1672531200000"
 *   - Unix seconds      e.g. "1672531200"  (converted to ms)
 *
 * Returns the timestamp in milliseconds, or null if unparseable.
 */
export function parseTimestamp(value: string): number | null {
  if (!value || String(value).trim() === '') return null;

  // Try numeric first
  const num = Number(value);
  if (!isNaN(num) && num > 0) {
    // Heuristic: values below 1e12 are likely Unix seconds, not ms
    return num < 1e12 ? num * 1000 : num;
  }

  // Try ISO date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }

  return null;
}
