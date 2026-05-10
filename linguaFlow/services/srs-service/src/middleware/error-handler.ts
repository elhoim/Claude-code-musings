import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({ name: 'error-handler' });

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';
  const message = statusCode === 500 ? 'An unexpected error occurred' : err.message;

  logger.error({ err, statusCode, code }, 'Request error');

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
