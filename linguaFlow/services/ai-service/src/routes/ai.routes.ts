import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireUser } from '../middleware/extract-user';
import * as feedbackService from '../services/feedback.service';
import * as conversationService from '../services/conversation.service';
import { generateText } from '../services/llm-client.service';
import { getGrammarExplanationSystemPrompt, buildGrammarExplanationUserMessage } from '../prompts/grammar-explanation';
import type { DrillMode } from '@linguaflow/shared';

const router = Router();

// POST /api/v1/ai/feedback/speaking — Generate feedback for a speaking drill
router.post('/feedback/speaking', requireUser, async (req: Request, res: Response) => {
  const { drillMode, cefrLevel, prompt, transcription, language } = req.body as {
    drillMode: DrillMode;
    cefrLevel: string;
    prompt: string;
    transcription: string;
    language: string;
  };

  if (!drillMode || !cefrLevel || !prompt || !transcription || !language) {
    res.status(400).json({
      error: { code: 'AI_001', message: 'drillMode, cefrLevel, prompt, transcription, and language are required' },
    });
    return;
  }

  try {
    const feedback = await feedbackService.generateDrillFeedback(
      drillMode,
      cefrLevel,
      prompt,
      transcription,
      language,
    );
    res.json(feedback);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate feedback';
    res.status(500).json({
      error: { code: 'AI_002', message },
    });
  }
});

// POST /api/v1/ai/explain — Generate grammar explanation
router.post('/explain', requireUser, async (req: Request, res: Response) => {
  const { grammarNodeName, grammarNodeDescription, sentence, language, cefrLevel } = req.body as {
    grammarNodeName: string;
    grammarNodeDescription: string;
    sentence?: string;
    language: string;
    cefrLevel: string;
  };

  if (!grammarNodeName || !grammarNodeDescription || !language || !cefrLevel) {
    res.status(400).json({
      error: { code: 'AI_001', message: 'grammarNodeName, grammarNodeDescription, language, and cefrLevel are required' },
    });
    return;
  }

  try {
    const systemPrompt = getGrammarExplanationSystemPrompt(language, cefrLevel);
    const userMessage = buildGrammarExplanationUserMessage(grammarNodeName, grammarNodeDescription, sentence);

    const response = await generateText(systemPrompt, userMessage, {
      temperature: 0.4,
      maxTokens: 1500,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse explanation JSON');
    }

    const explanation = JSON.parse(jsonMatch[0]);
    res.json(explanation);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate explanation';
    res.status(500).json({
      error: { code: 'AI_002', message },
    });
  }
});

// POST /api/v1/ai/conversation/start — Start AI conversation (Phase 2 stub)
router.post('/conversation/start', requireUser, async (req: Request, res: Response) => {
  const { language, cefrLevel, topic } = req.body as {
    language: string;
    cefrLevel: string;
    topic?: string;
  };

  try {
    const session = await conversationService.startConversation(
      req.userId!,
      language,
      cefrLevel,
      topic,
    );
    res.status(201).json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start conversation';
    res.status(501).json({
      error: { code: 'AI_003', message },
    });
  }
});

// POST /api/v1/ai/conversation/:id/message — Send message in AI conversation (Phase 2 stub)
router.post('/conversation/:id/message', requireUser, async (req: Request, res: Response) => {
  const { message } = req.body as { message: string };

  try {
    const response = await conversationService.sendMessage(req.params.id, message);
    res.json(response);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Failed to send message';
    res.status(501).json({
      error: { code: 'AI_003', message: errMessage },
    });
  }
});

export default router;
