import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as lessonService from '../services/lesson.service.js';

export const lessonRouter = Router();

// All lesson routes require an authenticated user
lessonRouter.use(extractUser);

// ---------------------------------------------------------------------------
// GET /learning-path?language=...
// ---------------------------------------------------------------------------

const learningPathQuery = z.object({
  language: z.string().min(2),
});

lessonRouter.get(
  '/learning-path',
  validate({ query: learningPathQuery }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language } = req.query as unknown as z.infer<typeof learningPathQuery>;
      const path = await lessonService.getLearningPath(req.user!.id, language);
      res.json({ data: path });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /:id
// ---------------------------------------------------------------------------

const lessonParams = z.object({
  id: z.string().uuid(),
});

lessonRouter.get(
  '/:id',
  validate({ params: lessonParams }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lesson = await lessonService.getLesson(req.params.id);

      if (!lesson) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Lesson not found' },
        });
        return;
      }

      res.json({ data: lesson });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /:id/complete
// ---------------------------------------------------------------------------

const completeBody = z.object({
  score: z.number().min(0).max(1),
  completed: z.boolean(),
});

lessonRouter.post(
  '/:id/complete',
  validate({ params: lessonParams, body: completeBody }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await lessonService.completeLesson(
        req.user!.id,
        req.params.id,
        req.body as z.infer<typeof completeBody>,
      );
      res.json({ data: progress });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /progress?language=...
// ---------------------------------------------------------------------------

lessonRouter.get(
  '/progress/summary',
  validate({ query: learningPathQuery }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language } = req.query as unknown as z.infer<typeof learningPathQuery>;
      const progress = await lessonService.getProgress(req.user!.id, language);
      res.json({ data: progress });
    } catch (err) {
      next(err);
    }
  },
);
