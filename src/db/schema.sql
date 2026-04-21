-- All tables use IF NOT EXISTS so this script is safe to run multiple times.

CREATE TABLE IF NOT EXISTS datasets (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  original_filename TEXT   NOT NULL,
  row_count        INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS candles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  timestamp  INTEGER NOT NULL,   -- Unix milliseconds
  open       REAL    NOT NULL,
  high       REAL    NOT NULL,
  low        REAL    NOT NULL,
  close      REAL    NOT NULL,
  volume     REAL    NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- Index to fetch candles for a dataset in chronological order quickly
CREATE INDEX IF NOT EXISTS idx_candles_dataset_timestamp
  ON candles(dataset_id, timestamp);

CREATE TABLE IF NOT EXISTS backtest_runs (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id           INTEGER NOT NULL,
  strategy_name        TEXT    NOT NULL,
  status               TEXT    NOT NULL DEFAULT 'pending',  -- pending | running | completed | failed
  initial_capital      REAL    NOT NULL,
  position_size        REAL    NOT NULL,
  start_date           INTEGER,                             -- first candle Unix ms
  end_date             INTEGER,                             -- last candle Unix ms
  final_cash           REAL,
  final_portfolio_value REAL,
  total_return_pct     REAL,
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at         TEXT,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE TABLE IF NOT EXISTS trades (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  backtest_run_id INTEGER NOT NULL,
  timestamp       INTEGER NOT NULL,   -- Unix milliseconds
  side            TEXT    NOT NULL,   -- BUY | SELL
  price           REAL    NOT NULL,
  quantity        REAL    NOT NULL,
  value           REAL    NOT NULL,
  pnl             REAL    NOT NULL DEFAULT 0,
  FOREIGN KEY (backtest_run_id) REFERENCES backtest_runs(id) ON DELETE CASCADE
);
