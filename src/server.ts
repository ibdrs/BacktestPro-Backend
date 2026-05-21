import app from './app';
import { runMigrations } from './db/migrations';

const PORT = process.env.PORT || 3000;

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`BacktestPro backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Migration failed, server not started:', err);
    process.exit(1);
  });
