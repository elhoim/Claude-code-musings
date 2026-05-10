import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireUser } from '../middleware/extract-user';
import * as drillService from '../services/drill.service';
import type { DrillMode } from '@linguaflow/shared';

const router = Router();

// POST /api/v1/practice/drills — Start a new drill session
router.post('/drills', requireUser, async (req: Request, res: Response) => {
  const { mode, language, cefrLevel, timeLimitSeconds } = req.body as {
    mode: DrillMode;
    language: string;
    cefrLevel: string;
    timeLimitSeconds?: number;
  };

  if (!mode || !language || !cefrLevel) {
    res.status(400).json({
      error: { code: 'PRACTICE_001', message: 'mode, language, and cefrLevel are required' },
    });
    return;
  }

  const session = await drillService.startDrill(
    req.userId!,
    mode,
    language,
    cefrLevel,
    timeLimitSeconds,
  );

  res.status(201).json(session);
});

// POST /api/v1/practice/drills/:id/submit — Submit drill response
router.post('/drills/:id/submit', requireUser, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { audioUrl, transcription, durationSeconds } = req.body as {
    audioUrl?: string;
    transcription?: string;
    durationSeconds?: number;
  };

  const existing = await drillService.getDrillById(id);
  if (!existing) {
    res.status(404).json({
      error: { code: 'PRACTICE_002', message: 'Drill session not found' },
    });
    return;
  }

  const updated = await drillService.submitDrill(id, {
    audioUrl,
    transcription,
    durationSeconds,
  });

  res.json(updated);
});

// GET /api/v1/practice/drills/:id/feedback — Get drill feedback
router.get('/drills/:id/feedback', requireUser, async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = await drillService.getDrillById(id);
  if (!session) {
    res.status(404).json({
      error: { code: 'PRACTICE_002', message: 'Drill session not found' },
    });
    return;
  }

  if (!session.feedbackJson) {
    res.status(404).json({
      error: { code: 'PRACTICE_003', message: 'Feedback not yet available' },
    });
    return;
  }

  res.json(session.feedbackJson);
});

// GET /api/v1/practice/history — Get drill history
router.get('/history', requireUser, async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const sessions = await drillService.getDrillHistory(req.userId!, limit);
  res.json(sessions);
});

export default router;
