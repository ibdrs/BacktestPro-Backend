// A candle as stored in the database
export interface Candle {
  id?: number;
  dataset_id: number;
  timestamp: number; // Unix milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// A raw row straight out of the CSV parser — every field is a string
export interface RawCandleRow {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}
