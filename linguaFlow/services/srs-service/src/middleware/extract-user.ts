import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Extracts user information from the x-user-id and x-user-email headers
 * set by the API gateway after JWT verification.
 */
export function extractUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userEmail = req.headers['x-user-email'] as string | undefined;

  if (!userId) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'User identification is required' },
    });
    return;
  }

  req.user = { id: userId, email: userEmail ?? '' };
  next();
}
