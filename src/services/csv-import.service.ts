import { parse } from 'csv-parse';
import fs from 'fs';
import { RawCandleRow, Candle } from '../types/candle';
import { validateCandleRow, parseTimestamp } from '../validators/candle.validator';

export interface CsvImportResult {
  validCandles: Omit<Candle, 'id'>[];
  errors: string[];
  totalRows: number;
}

/**
 * Parse and validate a CSV file.
 *
 * Streams the file row by row so it doesn't load the entire file into memory.
 * Returns all valid candles (sorted by timestamp) and any validation errors.
 */
export async function parseCsvFile(
  filePath: string,
  datasetId: number
): Promise<CsvImportResult> {
  return new Promise((resolve, reject) => {
    const validCandles: Omit<Candle, 'id'>[] = [];
    const errors: string[] = [];
    let rowIndex = 0;

    const parser = fs
      .createReadStream(filePath)
      .pipe(
        parse({
          columns: true,          // treat first row as column headers
          skip_empty_lines: true,
          trim: true,
        })
      );

    parser.on('data', (row: RawCandleRow) => {
      rowIndex++;
      const result = validateCandleRow(row, rowIndex);

      if (result.valid) {
        validCandles.push({
          dataset_id: datasetId,
          timestamp: parseTimestamp(row.timestamp)!,
          open:   Number(row.open),
          high:   Number(row.high),
          low:    Number(row.low),
          close:  Number(row.close),
          volume: Number(row.volume),
        });
      } else {
        errors.push(...result.errors);
      }
    });

    parser.on('end', () => {
      // Ensure candles are in chronological order regardless of CSV order
      validCandles.sort((a, b) => a.timestamp - b.timestamp);
      resolve({ validCandles, errors, totalRows: rowIndex });
    });

    parser.on('error', (err) => {
      reject(new Error(`CSV parse error: ${err.message}`));
    });
  });
}
