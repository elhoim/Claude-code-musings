import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as deckService from '../services/deck.service.js';

export const deckRouter = Router();

deckRouter.use(extractUser);

// ---------------------------------------------------------------------------
// GET /decks
// ---------------------------------------------------------------------------

deckRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decks = await deckService.getDecks(req.user!.id);
      res.json({ data: decks });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /decks
// ---------------------------------------------------------------------------

const createDeckBody = z.object({
  languageProfileId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

deckRouter.post(
  '/',
  validate({ body: createDeckBody }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deck = await deckService.createDeck({
        userId: req.user!.id,
        ...req.body,
      });
      res.status(201).json({ data: deck });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /decks/:id
// ---------------------------------------------------------------------------

const deckParams = z.object({
  id: z.string().uuid(),
});

deckRouter.get(
  '/:id',
  validate({ params: deckParams }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deck = await deckService.getDeck(req.user!.id, req.params.id);

      if (!deck) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Deck not found' },
        });
        return;
      }

      res.json({ data: deck });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// DELETE /decks/:id
// ---------------------------------------------------------------------------

deckRouter.delete(
  '/:id',
  validate({ params: deckParams }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await deckService.deleteDeck(req.user!.id, req.params.id);

      if (!deleted) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Deck not found' },
        });
        return;
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
