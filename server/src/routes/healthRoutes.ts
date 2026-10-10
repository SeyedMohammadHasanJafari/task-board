import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name,
    },
  });
});

router.get('/hello', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hello World from Collaborative Task Board Express API!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
