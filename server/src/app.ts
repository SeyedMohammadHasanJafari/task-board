import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { isOriginAllowed } from './config/cors.js';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logging
  if (!ENV.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/boards', boardRoutes);
  app.use('/api/cards', cardRoutes);

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
