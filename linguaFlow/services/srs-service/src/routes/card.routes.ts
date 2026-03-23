import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as cardService from '../services/card.service.js';

export const cardRouter = Router();

cardRouter.use(extractUser);

// ---------------------------------------------------------------------------
// POST /cards
// ---------------------------------------------------------------------------

const createCardBody = z.object({
  deckId: z.string().uuid(),
  languageProfileId: z.string().uuid(),
  frontType: z.string().min(1),
  frontPrimary: z.string().min(1),
  frontSecondary: z.string().optional(),
  frontAudioUrl: z.string().url().optional(),
  frontImageUrl: z.string().url().optional(),
  frontContext: z.string().optional(),
  backType: z.string().min(1),
  backPrimary: z.string().min(1),
  backSecondary: z.string().optional(),
  backAudioUrl: z.string().url().optional(),
  backImageUrl: z.string().url().optional(),
  backContext: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
});

cardRouter.post(
  '/',
  validate({ body: createCardBody }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await cardService.createCard({
        userId: req.user!.id,
        ...req.body,
      });
      res.status(201).json({ data: card });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /cards/due?deckId=...&limit=...
// ---------------------------------------------------------------------------

const dueCardsQuery = z.object({
  deckId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

cardRouter.get(
  '/due',
  validate({ query: dueCardsQuery }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deckId, limit } = req.query as unknown as z.infer<typeof dueCardsQuery>;
      const dueCards = await cardService.getDueCards(deckId, limit);
      res.json({ data: dueCards });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /cards/:id
// ---------------------------------------------------------------------------

const cardParams = z.object({
  id: z.string().uuid(),
});

cardRouter.get(
  '/:id',
  validate({ params: cardParams }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await cardService.getCardById(req.params.id);

      if (!card) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Card not found' },
        });
        return;
      }

      res.json({ data: card });
    } catch (err) {
      next(err);
    }
  },
);
