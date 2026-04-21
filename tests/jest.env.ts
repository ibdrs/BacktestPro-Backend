// This file runs before any module is imported in each test suite.
// We set environment variables here so the DB and upload modules
// pick them up when they first load.
process.env.DB_PATH    = ':memory:';
process.env.UPLOAD_DIR = './uploads-test';
process.env.NODE_ENV   = 'test';
