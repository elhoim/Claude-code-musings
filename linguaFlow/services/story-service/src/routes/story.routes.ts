import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireUser } from '../middleware/extract-user';
import * as storyService from '../services/story.service';

const router = Router();

// GET /api/v1/stories/:lang — List stories by language
router.get('/:lang', async (req: Request, res: Response) => {
  const stories = await storyService.getStories(req.params.lang);
  res.json(stories);
});

// GET /api/v1/stories/:id — Get story with segments
router.get('/:id', async (req: Request, res: Response) => {
  const story = await storyService.getStory(req.params.id);
  if (!story) {
    res.status(404).json({
      error: { code: 'STORY_001', message: 'Story not found' },
    });
    return;
  }
  res.json(story);
});

// GET /api/v1/stories/:id/state — Get user's state for a story
router.get('/:id/state', requireUser, async (req: Request, res: Response) => {
  const state = await storyService.getStoryState(req.userId!, req.params.id);
  if (!state) {
    res.status(404).json({
      error: { code: 'STORY_002', message: 'No story state found. Start the story first.' },
    });
    return;
  }
  res.json(state);
});

// POST /api/v1/stories/:id/start — Start reading a story
router.post('/:id/start', requireUser, async (req: Request, res: Response) => {
  const story = await storyService.getStory(req.params.id);
  if (!story) {
    res.status(404).json({
      error: { code: 'STORY_001', message: 'Story not found' },
    });
    return;
  }

  const state = await storyService.startStory(req.userId!, req.params.id);
  res.status(201).json(state);
});

// POST /api/v1/stories/:id/choice — Make a choice in the story
router.post('/:id/choice', requireUser, async (req: Request, res: Response) => {
  const { choiceId } = req.body as { choiceId: string };

  if (!choiceId) {
    res.status(400).json({
      error: { code: 'STORY_003', message: 'choiceId is required' },
    });
    return;
  }

  try {
    const updated = await storyService.makeChoice(req.userId!, req.params.id, choiceId);
    res.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to make choice';
    res.status(400).json({
      error: { code: 'STORY_004', message },
    });
  }
});

export default router;
