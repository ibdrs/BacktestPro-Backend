CREATE TABLE IF NOT EXISTS datasets (
  id                SERIAL        PRIMARY KEY,
  name              TEXT          NOT NULL,
  original_filename TEXT          NOT NULL,
  row_count         INTEGER       NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candles (
  id         SERIAL      PRIMARY KEY,
  dataset_id INTEGER     NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  timestamp  BIGINT      NOT NULL,
  open       DOUBLE PRECISION NOT NULL,
  high       DOUBLE PRECISION NOT NULL,
  low        DOUBLE PRECISION NOT NULL,
  close      DOUBLE PRECISION NOT NULL,
  volume     DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_candles_dataset_timestamp
  ON candles(dataset_id, timestamp);

CREATE TABLE IF NOT EXISTS backtest_runs (
  id                    SERIAL        PRIMARY KEY,
  dataset_id            INTEGER       NOT NULL REFERENCES datasets(id),
  strategy_name         TEXT          NOT NULL,
  status                TEXT          NOT NULL DEFAULT 'pending',
  initial_capital       DOUBLE PRECISION NOT NULL,
  position_size         DOUBLE PRECISION NOT NULL,
  start_date            BIGINT,
  end_date              BIGINT,
  final_cash            DOUBLE PRECISION,
  final_portfolio_value DOUBLE PRECISION,
  total_return_pct      DOUBLE PRECISION,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trades (
  id              SERIAL           PRIMARY KEY,
  backtest_run_id INTEGER          NOT NULL REFERENCES backtest_runs(id) ON DELETE CASCADE,
  timestamp       BIGINT           NOT NULL,
  side            TEXT             NOT NULL,
  price           DOUBLE PRECISION NOT NULL,
  quantity        DOUBLE PRECISION NOT NULL,
  value           DOUBLE PRECISION NOT NULL,
  pnl             DOUBLE PRECISION NOT NULL DEFAULT 0
);
