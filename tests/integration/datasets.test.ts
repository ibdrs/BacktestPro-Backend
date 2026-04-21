import request from 'supertest';
import path from 'path';
import app from '../../src/app';
import { runMigrations } from '../../src/db/migrations';

// Each test file gets its own fresh in-memory DB (Jest module isolation).
// We create the schema here before any test runs.
beforeAll(() => {
  runMigrations();
});

const CSV_PATH = path.join(__dirname, '../fixtures/valid-candles.csv');

describe('POST /api/datasets/import', () => {
  it('imports a valid CSV and returns dataset metadata', async () => {
    const res = await request(app)
      .post('/api/datasets/import')
      .attach('file', CSV_PATH);

    expect(res.status).toBe(201);
    expect(res.body.dataset).toBeDefined();
    expect(res.body.dataset.id).toBeDefined();
    expect(res.body.validRows).toBeGreaterThan(0);
    expect(res.body.totalRows).toBe(res.body.validRows); // fixture has no bad rows
    expect(res.body.skippedRows).toBe(0);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/datasets/import');
    expect(res.status).toBe(400);
  });

  it('returns 400 when a non-CSV file is attached', async () => {
    // Create an inline buffer with a fake txt content and send it as .txt
    const res = await request(app)
      .post('/api/datasets/import')
      .attach('file', Buffer.from('hello world'), {
        filename:    'test.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/datasets', () => {
  it('returns an array of datasets', async () => {
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('includes the dataset we just imported', async () => {
    // Import one more
    await request(app)
      .post('/api/datasets/import')
      .attach('file', CSV_PATH);

    const res = await request(app).get('/api/datasets');
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
