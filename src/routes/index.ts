import { Router } from 'express';
import { uploadMiddleware }                     from '../libraries/upload.middleware';
import { importDataset, getDatasets }           from '../controllers/dataset.controller';
import { createBacktest, getBacktests, getBacktestById } from '../controllers/backtest.controller';

const router = Router();

// Dataset endpoints 
router.post('/datasets/import', uploadMiddleware, importDataset);
router.get('/datasets', getDatasets);

// Backtest endpoints
router.post('/backtests', createBacktest);
router.get('/backtests', getBacktests);
router.get('/backtests/:id', getBacktestById);

export default router;
