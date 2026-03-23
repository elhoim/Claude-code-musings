import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireUser } from '../middleware/extract-user';
import * as grammarService from '../services/grammar-graph.service';
import type { LanguageCode } from '@linguaflow/shared';

const router = Router();

// GET /api/v1/grammar/:lang/graph
router.get('/:lang/graph', async (req: Request, res: Response) => {
  const graph = await grammarService.getGrammarGraph(req.params.lang as LanguageCode);
  res.json(graph);
});

// GET /api/v1/grammar/:lang/nodes/:id
router.get('/:lang/nodes/:id', async (req: Request, res: Response) => {
  const node = await grammarService.getGrammarNode(
    req.params.lang as LanguageCode,
    req.params.id,
  );
  if (!node) {
    res.status(404).json({ error: { code: 'GRAMMAR_001', message: 'Grammar node not found' } });
    return;
  }
  res.json(node);
});

// GET /api/v1/grammar/:lang/progress
router.get('/:lang/progress', requireUser, async (req: Request, res: Response) => {
  const progress = await grammarService.getUserProgress(
    req.userId!,
    req.params.lang as LanguageCode,
  );
  res.json(progress);
});

// POST /api/v1/grammar/:lang/nodes/:id/why
router.post('/:lang/nodes/:id/why', requireUser, async (req: Request, res: Response) => {
  const node = await grammarService.getGrammarNode(
    req.params.lang as LanguageCode,
    req.params.id,
  );
  if (!node) {
    res.status(404).json({ error: { code: 'GRAMMAR_001', message: 'Grammar node not found' } });
    return;
  }

  // In Phase 1, return the static explanation. Phase 2 will use LLM.
  res.json({
    grammarNodeId: node.id,
    sentence: req.body.sentence || '',
    explanation: node.fullExplanation || node.shortDescription,
    relatedExamples: node.examples,
  });
});

export default router;
