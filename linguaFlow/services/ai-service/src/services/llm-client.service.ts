import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export interface GenerateTextOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export async function generateText(
  systemPrompt: string,
  userMessage: string,
  options: GenerateTextOptions = {},
): Promise<string> {
  const {
    maxTokens = 2048,
    temperature = 0.7,
    model = 'claude-sonnet-4-20250514',
  } = options;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from LLM');
  }

  return textBlock.text;
}
