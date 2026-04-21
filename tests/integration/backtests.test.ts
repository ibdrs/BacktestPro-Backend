import request from 'supertest';
import path from 'path';
import app from '../../src/app';
import { runMigrations } from '../../src/db/migrations';

const CSV_PATH = path.join(__dirname, '../fixtures/valid-candles.csv');

let datasetId: number;

// Set up schema and seed a dataset that all backtest tests will use
beforeAll(async () => {
  runMigrations();

  const res = await request(app)
    .post('/api/datasets/import')
    .attach('file', CSV_PATH);

  datasetId = res.body.dataset.id;
});

const validBody = () => ({
  datasetId,
  strategy:       'momentum',
  initialCapital: 10000,
  positionSize:   0.5,
});

describe('POST /api/backtests', () => {
  it('runs a backtest and returns a completed result', async () => {
    const res = await request(app).post('/api/backtests').send(validBody());

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('completed');
    expect(typeof res.body.total_return_pct).toBe('number');
    expect(Array.isArray(res.body.trades)).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .send({ strategy: 'momentum' }); // missing datasetId, initialCapital, positionSize

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 400 for an unsupported strategy', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .send({ ...validBody(), strategy: 'neural-net' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid positionSize', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .send({ ...validBody(), positionSize: 1.5 });

    expect(res.status).toBe(400);
  });

  it('returns 500 for a non-existent dataset', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .send({ ...validBody(), datasetId: 999999 });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/backtests', () => {
  it('returns an array of backtest runs', async () => {
    const res = await request(app).get('/api/backtests');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/backtests/:id', () => {
  it('returns a specific backtest run with its trades', async () => {
    // Create a run first
    const created = await request(app).post('/api/backtests').send(validBody());
    const id      = created.body.id;

    const res = await request(app).get(`/api/backtests/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(Array.isArray(res.body.trades)).toBe(true);
  });

  it('returns 404 for a non-existent run', async () => {
    const res = await request(app).get('/api/backtests/999999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-numeric ID', async () => {
    const res = await request(app).get('/api/backtests/abc');
    expect(res.status).toBe(400);
  });
});
