export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const SUPPORTED_STRATEGIES = ['momentum'];

/**
 * Validate the request body for POST /api/backtests.
 * Returns a list of human-readable errors if the input is invalid.
 */
export function validateBacktestInput(body: any): ValidationResult {
  const errors: string[] = [];

  // datasetId
  if (body.datasetId === undefined || body.datasetId === null) {
    errors.push('"datasetId" is required');
  } else if (!Number.isInteger(Number(body.datasetId)) || Number(body.datasetId) <= 0) {
    errors.push('"datasetId" must be a positive integer');
  }

  // strategy
  if (!body.strategy) {
    errors.push('"strategy" is required');
  } else if (!SUPPORTED_STRATEGIES.includes(body.strategy)) {
    errors.push(`"strategy" must be one of: ${SUPPORTED_STRATEGIES.join(', ')}`);
  }

  // initialCapital
  if (body.initialCapital === undefined || body.initialCapital === null) {
    errors.push('"initialCapital" is required');
  } else if (isNaN(Number(body.initialCapital)) || Number(body.initialCapital) <= 0) {
    errors.push('"initialCapital" must be a positive number');
  }

  // positionSize — fraction of cash to commit per trade (0 < ps <= 1)
  if (body.positionSize === undefined || body.positionSize === null) {
    errors.push('"positionSize" is required');
  } else {
    const ps = Number(body.positionSize);
    if (isNaN(ps) || ps <= 0 || ps > 1) {
      errors.push('"positionSize" must be a number between 0 (exclusive) and 1 (inclusive)');
    }
  }

  return { valid: errors.length === 0, errors };
}
