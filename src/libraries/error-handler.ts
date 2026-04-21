import { Request, Response, NextFunction } from 'express';

// Central error handler that runs after every
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`);

  // Show the stack trace in dev environment for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
}
