import { Router, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function proxy(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq(proxyReq, req) {
        const incomingReq = req as Request;
        if (incomingReq.user) {
          proxyReq.setHeader('X-User-Id', incomingReq.user.id);
          proxyReq.setHeader('X-User-Email', incomingReq.user.email);
        }
        const requestId = incomingReq.headers['x-request-id'];
        if (requestId) {
          proxyReq.setHeader('X-Request-Id', requestId as string);
        }
      },
    },
  });
}

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
router.use('/api/v1/auth', proxy(env.USER_SERVICE_URL));

// Protected routes
router.use('/api/v1/users', requireAuth, proxy(env.USER_SERVICE_URL));
router.use('/api/v1/lessons', requireAuth, proxy(env.LESSON_SERVICE_URL));
router.use('/api/v1/srs', requireAuth, proxy(env.SRS_SERVICE_URL));
router.use('/api/v1/grammar', requireAuth, proxy(env.GRAMMAR_SERVICE_URL));
router.use('/api/v1/stories', requireAuth, proxy(env.STORY_SERVICE_URL));
router.use('/api/v1/practice', requireAuth, proxy(env.PRACTICE_SERVICE_URL));
router.use('/api/v1/ai', requireAuth, proxy(env.AI_SERVICE_URL));

export { router };
