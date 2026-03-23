import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function extractUser(req: Request, _res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  if (typeof userId === 'string') {
    req.userId = userId;
  }
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({ error: { code: 'AUTH_001', message: 'Authentication required' } });
    return;
  }
  next();
}
