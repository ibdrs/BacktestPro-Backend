const { Client } = require('pg');

module.exports = async function globalSetup() {
  const testUrl = process.env.DATABASE_URL_TEST ?? 'postgres://backtestpro:backtestpro@localhost:5432/backtestpro_test';
  const url = new URL(testUrl);
  const dbName = url.pathname.slice(1);

  const client = new Client({
    host: url.hostname,
    port: Number(url.port) || 5432,
    user: url.username,
    password: url.password,
    database: 'postgres',
  });

  await client.connect();
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`[globalSetup] Created test database: ${dbName}`);
  }
  await client.end();
};
