import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as reviewService from '../services/review.service.js';

export const reviewRouter = Router();

reviewRouter.use(extractUser);

// ---------------------------------------------------------------------------
// POST /reviews
// ---------------------------------------------------------------------------

const submitReviewBody = z.object({
  cardId: z.string().uuid(),
  rating: z.number().int().min(1).max(4),
  reviewDurationMs: z.number().int().min(0).optional(),
});

reviewRouter.post(
  '/',
  validate({ body: submitReviewBody }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cardId, rating, reviewDurationMs } = req.body as z.infer<typeof submitReviewBody>;
      const result = await reviewService.submitReview(
        cardId,
        req.user!.id,
        rating,
        reviewDurationMs,
      );

      if (!result) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Card not found' },
        });
        return;
      }

      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /reviews/stats
// ---------------------------------------------------------------------------

reviewRouter.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await reviewService.getStats(req.user!.id);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  },
);
