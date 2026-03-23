import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as placementService from '../services/placement.service.js';

export const placementRouter = Router();

// All placement routes require an authenticated user
placementRouter.use(extractUser);

// ---------------------------------------------------------------------------
// GET /placement?language=...
// ---------------------------------------------------------------------------

const placementQuery = z.object({
  language: z.string().min(2),
});

placementRouter.get(
  '/',
  validate({ query: placementQuery }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language } = req.query as unknown as z.infer<typeof placementQuery>;
      const questions = await placementService.getPlacementTest(language);
      res.json({ data: questions });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /placement/evaluate
// ---------------------------------------------------------------------------

const evaluateBody = z.object({
  language: z.string().min(2),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.string(),
    }),
  ),
});

placementRouter.post(
  '/evaluate',
  validate({ body: evaluateBody }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language, answers } = req.body as z.infer<typeof evaluateBody>;
      const result = await placementService.evaluatePlacement(language, answers);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);
