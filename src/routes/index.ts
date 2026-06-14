import { Router } from 'express';
import { uploadMiddleware }                                   from '../libraries/upload.middleware';
import { importDataset, getDatasets }                        from '../controllers/dataset.controller';
import { createBacktest, getBacktests, getBacktestById }     from '../controllers/backtest.controller';
import { register, login }                                   from '../controllers/auth.controller';
import { requireAuth }                                       from '../libraries/auth.middleware';

const router = Router();

// Auth routes (public — no token required)
router.post('/auth/register', register);
router.post('/auth/login',    login);

// Dataset endpoints (requires auth)
router.post('/datasets/import', requireAuth, uploadMiddleware, importDataset);
router.get('/datasets',         requireAuth, getDatasets);

// Backtest endpoints (requires auth, results scoped to the logged-in user)
router.post('/backtests',      requireAuth, createBacktest);
router.get('/backtests',       requireAuth, getBacktests);
router.get('/backtests/:id',   requireAuth, getBacktestById);

export default router;
