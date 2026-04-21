import fs from 'fs';
import path from 'path';
import { parseCsvFile } from './csv-import.service';
import * as datasetRepo from '../repositories/dataset.repository';
import * as candleRepo from '../repositories/candle.repository';
import { Dataset } from '../types/dataset';

export interface ImportResult {
  dataset: Dataset;
  validRows: number;
  totalRows: number;
  errors: string[];
}

/**
 * Full pipeline: parse a CSV file, validate rows, save candles to the DB,
 * and clean up the temp upload file.
 */
export async function importCsv(
  filePath: string,
  originalFilename: string
): Promise<ImportResult> {
  // Strip extension to use as a human-readable dataset name
  const name = path.basename(originalFilename, path.extname(originalFilename));

  // Insert a dataset row immediately so we have an ID to attach candles to
  const datasetId = datasetRepo.insertDataset({
    name,
    original_filename: originalFilename,
    row_count: 0,
  });

  try {
    const { validCandles, errors, totalRows } = await parseCsvFile(filePath, datasetId);

    if (validCandles.length > 0) {
      candleRepo.insertCandles(validCandles);
    }

    // Update row_count to reflect how many candles were actually saved
    datasetRepo.updateDatasetRowCount(datasetId, validCandles.length);

    // Delete the temp file — data is now in SQLite
    fs.unlinkSync(filePath);

    const dataset = datasetRepo.findDatasetById(datasetId)!;
    return { dataset, validRows: validCandles.length, totalRows, errors };
  } catch (err) {
    // Always clean up the file, even if something fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw err;
  }
}

export function getAllDatasets(): Dataset[] {
  return datasetRepo.findAllDatasets();
}
