import { generateText } from './llm-client.service';
import { getDrillFeedbackSystemPrompt } from '../prompts/drill-feedback';
import type { DrillFeedback, DrillMode } from '@linguaflow/shared';

export async function generateDrillFeedback(
  drillMode: DrillMode,
  cefrLevel: string,
  prompt: string,
  transcription: string,
  language: string,
): Promise<DrillFeedback> {
  const systemPrompt = getDrillFeedbackSystemPrompt(drillMode, cefrLevel, language);

  const userMessage = `Prompt given to the student:
${prompt}

Student's spoken response (transcription):
${transcription}

Please evaluate this response and return your feedback as JSON.`;

  const response = await generateText(systemPrompt, userMessage, {
    temperature: 0.3,
    maxTokens: 2048,
  });

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse feedback JSON from LLM response');
  }

  const feedback = JSON.parse(jsonMatch[0]) as DrillFeedback;
  return feedback;
}
