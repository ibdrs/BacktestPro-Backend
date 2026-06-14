import request from 'supertest';
import path from 'path';
import app from '../../src/app';
import { runMigrations } from '../../src/db/migrations';
import pool from '../../src/db/postgres';

const CSV_PATH = path.join(__dirname, '../fixtures/valid-candles.csv');

let token: string;
let datasetId: number;

beforeAll(async () => {
  await runMigrations();
  await pool.query('TRUNCATE trades, backtest_runs, candles, datasets, users RESTART IDENTITY CASCADE');

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'backtests@test.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'backtests@test.com', password: 'password123' });

  token = loginRes.body.token;

  const res = await request(app)
    .post('/api/datasets/import')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', CSV_PATH);

  datasetId = res.body.dataset.id;
});

afterAll(async () => {
  await pool.end();
});

const validBody = () => ({
  datasetId,
  strategy:       'momentum',
  initialCapital: 10000,
  positionSize:   0.5,
});

describe('POST /api/backtests', () => {
  it('runs a backtest and returns a completed result', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody());

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('completed');
    expect(typeof res.body.total_return_pct).toBe('number');
    expect(Array.isArray(res.body.trades)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).post('/api/backtests').send(validBody());
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send({ strategy: 'momentum' });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 400 for an unsupported strategy', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validBody(), strategy: 'neural-net' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid positionSize', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validBody(), positionSize: 1.5 });

    expect(res.status).toBe(400);
  });

  it('returns 500 for a non-existent dataset', async () => {
    const res = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validBody(), datasetId: 999999 });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/backtests', () => {
  it('returns an array of backtest runs', async () => {
    const res = await request(app)
      .get('/api/backtests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/backtests');
    expect(res.status).toBe(401);
  });

  it('does not return backtests belonging to another user', async () => {
    await request(app).post('/api/auth/register').send({ email: 'other@test.com', password: 'password123' });
    const otherLogin = await request(app).post('/api/auth/login').send({ email: 'other@test.com', password: 'password123' });
    const otherToken = otherLogin.body.token;

    const res = await request(app)
      .get('/api/backtests')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/backtests/:id', () => {
  it('returns a specific backtest run with its trades', async () => {
    const created = await request(app)
      .post('/api/backtests')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody());

    const id = created.body.id;

    const res = await request(app)
      .get(`/api/backtests/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(Array.isArray(res.body.trades)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/backtests/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent run', async () => {
    const res = await request(app)
      .get('/api/backtests/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-numeric ID', async () => {
    const res = await request(app)
      .get('/api/backtests/abc')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
