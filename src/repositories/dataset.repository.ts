import db from '../db/sqlite';
import { Dataset } from '../types/dataset';

export function insertDataset(
  dataset: Omit<Dataset, 'id' | 'created_at'>
): number {
  const stmt = db.prepare(`
    INSERT INTO datasets (name, original_filename, row_count)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    dataset.name,
    dataset.original_filename,
    dataset.row_count
  );
  return result.lastInsertRowid as number;
}

export function updateDatasetRowCount(id: number, rowCount: number): void {
  db.prepare('UPDATE datasets SET row_count = ? WHERE id = ?').run(rowCount, id);
}

export function findAllDatasets(): Dataset[] {
  return db
    .prepare('SELECT * FROM datasets ORDER BY created_at DESC')
    .all() as unknown as Dataset[];
}

export function findDatasetById(id: number): Dataset | undefined {
  return db
    .prepare('SELECT * FROM datasets WHERE id = ?')
    .get(id) as unknown as Dataset | undefined;
}
