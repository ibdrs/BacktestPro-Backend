import { Request, Response, NextFunction } from 'express';
import * as datasetService from '../services/dataset.service';

export async function importDataset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded. Send a CSV as multipart/form-data with field name "file".',
      });
      return;
    }

    const result = await datasetService.importCsv(
      req.file.path,
      req.file.originalname
    );

    res.status(201).json({
      dataset:    result.dataset,
      validRows:  result.validRows,
      totalRows:  result.totalRows,
      skippedRows: result.totalRows - result.validRows,
      errors:     result.errors,
    });
  } catch (err) {
    next(err);
  }
}

export function getDatasets(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    res.json(datasetService.getAllDatasets());
  } catch (err) {
    next(err);
  }
}
