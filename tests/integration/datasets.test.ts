import request from 'supertest';
import path from 'path';
import app from '../../src/app';
import { runMigrations } from '../../src/db/migrations';
import pool from '../../src/db/postgres';

let token: string;

beforeAll(async () => {
  await runMigrations();
  await pool.query('TRUNCATE trades, backtest_runs, candles, datasets, users RESTART IDENTITY CASCADE');

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'datasets@test.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'datasets@test.com', password: 'password123' });

  token = loginRes.body.token;
});

afterAll(async () => {
  await pool.end();
});

const CSV_PATH = path.join(__dirname, '../fixtures/valid-candles.csv');

describe('POST /api/datasets/import', () => {
  it('imports a valid CSV and returns dataset metadata', async () => {
    const res = await request(app)
      .post('/api/datasets/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', CSV_PATH);

    expect(res.status).toBe(201);
    expect(res.body.dataset).toBeDefined();
    expect(res.body.dataset.id).toBeDefined();
    expect(res.body.validRows).toBeGreaterThan(0);
    expect(res.body.totalRows).toBe(res.body.validRows);
    expect(res.body.skippedRows).toBe(0);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/datasets/import')
      .attach('file', CSV_PATH);

    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/datasets/import')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 400 when a non-CSV file is attached', async () => {
    const res = await request(app)
      .post('/api/datasets/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('hello world'), {
        filename:    'test.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/datasets', () => {
  it('returns an array of datasets', async () => {
    const res = await request(app)
      .get('/api/datasets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(401);
  });

  it('includes the dataset we just imported', async () => {
    await request(app)
      .post('/api/datasets/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', CSV_PATH);

    const res = await request(app)
      .get('/api/datasets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
