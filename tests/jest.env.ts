process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? 'postgres://backtestpro:backtestpro@localhost:5432/backtestpro_test';
process.env.UPLOAD_DIR   = './uploads-test';
process.env.NODE_ENV     = 'test';
process.env.JWT_SECRET   = 'test-secret-do-not-use-in-production';
