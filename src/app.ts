import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './libraries/error-handler';

dotenv.config();

const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All API routes live under /api
app.use('/api', routes);

// Central error handler — must be the last library thats registered
app.use(errorHandler);

export default app;
