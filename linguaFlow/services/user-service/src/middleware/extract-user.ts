import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Extracts the user ID from the x-user-id header,
 * which is set by the API gateway after JWT verification.
 */
export function extractUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];

  if (!userId || typeof userId !== 'string') {
    res.status(401).json({
      error: { code: 'AUTH_003', message: 'Missing or invalid user identification' },
    });
    return;
  }

  req.userId = userId;
  next();
}
