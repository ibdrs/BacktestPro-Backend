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

export async function importCsv(
  filePath: string,
  originalFilename: string
): Promise<ImportResult> {
  const name = path.basename(originalFilename, path.extname(originalFilename));

  const datasetId = await datasetRepo.insertDataset({
    name,
    original_filename: originalFilename,
    row_count: 0,
  });

  try {
    const { validCandles, errors, totalRows } = await parseCsvFile(filePath, datasetId);

    if (validCandles.length > 0) {
      await candleRepo.insertCandles(validCandles);
    }

    await datasetRepo.updateDatasetRowCount(datasetId, validCandles.length);

    fs.unlinkSync(filePath);

    const dataset = (await datasetRepo.findDatasetById(datasetId))!;
    return { dataset, validRows: validCandles.length, totalRows, errors };
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw err;
  }
}

export async function getAllDatasets(): Promise<Dataset[]> {
  return datasetRepo.findAllDatasets();
}
