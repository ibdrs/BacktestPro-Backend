import app from './app';
import { runMigrations } from './db/migrations';

const PORT = process.env.PORT || 3000;

// Apply DB schema on startup before accepting requests
runMigrations();

app.listen(PORT, () => {
  console.log(`BacktestPro backend running on http://localhost:${PORT}`);
});
