import { Request, Response, NextFunction } from 'express';
import * as backtestService from '../services/backtest.service';
import { validateBacktestInput } from '../validators/backtest.validator';

export async function createBacktest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = validateBacktestInput(req.body);
    if (!validation.valid) {
      res.status(400).json({ errors: validation.errors });
      return;
    }

    const result = await backtestService.runBacktest({
      datasetId:      Number(req.body.datasetId),
      userId:         req.user!.id,
      strategy:       req.body.strategy,
      initialCapital: Number(req.body.initialCapital),
      positionSize:   Number(req.body.positionSize),
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBacktests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await backtestService.getAllBacktests(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function getBacktestById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid backtest ID.' });
      return;
    }

    const run = await backtestService.getBacktestById(id, req.user!.id);
    if (!run) {
      res.status(404).json({ error: `Backtest run ${id} not found.` });
      return;
    }

    res.json(run);
  } catch (err) {
    next(err);
  }
}
