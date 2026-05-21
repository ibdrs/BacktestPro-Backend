import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './libraries/error-handler';
import { swaggerDocument, swaggerUiOptions } from './swagger';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:8080'];

app.use(cors({ origin: allowedOrigins }));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// All API routes live under /api
app.use('/api', routes);

// Central error handler — must be the last library thats registered
app.use(errorHandler);

export default app;
