import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    message,
    statusCode,
    stack: ENV.isProduction ? undefined : err.stack,
    details: err.details,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(ENV.isProduction ? {} : { stack: err.stack }),
  });
}
