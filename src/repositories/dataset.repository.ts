import pool from '../db/postgres';
import { Dataset } from '../types/dataset';

export async function insertDataset(
  dataset: Omit<Dataset, 'id' | 'created_at'>
): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO datasets (name, original_filename, row_count)
     VALUES ($1, $2, $3) RETURNING id`,
    [dataset.name, dataset.original_filename, dataset.row_count]
  );
  return rows[0].id;
}

export async function updateDatasetRowCount(id: number, rowCount: number): Promise<void> {
  await pool.query('UPDATE datasets SET row_count = $1 WHERE id = $2', [rowCount, id]);
}

export async function findAllDatasets(): Promise<Dataset[]> {
  const { rows } = await pool.query<Dataset>(
    'SELECT * FROM datasets ORDER BY created_at DESC'
  );
  return rows;
}

export async function findDatasetById(id: number): Promise<Dataset | undefined> {
  const { rows } = await pool.query<Dataset>(
    'SELECT * FROM datasets WHERE id = $1',
    [id]
  );
  return rows[0];
}
