/**
 * AI Conversation Service — Phase 2 Placeholder
 *
 * This module will power free-form AI conversations for language practice.
 * Currently exports stub functions to define the interface.
 */

export interface ConversationSession {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  topic?: string;
  messages: ConversationMessage[];
  startedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function startConversation(
  _userId: string,
  _language: string,
  _cefrLevel: string,
  _topic?: string,
): Promise<ConversationSession> {
  // Phase 2: Will create a conversation session backed by LLM context
  throw new Error('Conversation feature is not yet available (Phase 2)');
}

export async function sendMessage(
  _conversationId: string,
  _message: string,
): Promise<ConversationMessage> {
  // Phase 2: Will send user message and get AI response
  throw new Error('Conversation feature is not yet available (Phase 2)');
}
