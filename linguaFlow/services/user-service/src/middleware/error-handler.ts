import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/auth.service.js';
import pino from 'pino';

const logger = pino({ name: 'user-service' });

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'GEN_002',
      message: 'Internal server error',
    },
  });
}
