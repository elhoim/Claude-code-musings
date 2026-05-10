import { pgTable, uuid, text, integer, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

export const drillSessions = pgTable('drill_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  mode: text('mode').notNull(), // 'reformulation' | 'situation_response' | 'narrative_sprint'
  language: text('language').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  timeLimitSeconds: integer('time_limit_seconds').notNull(),
  promptType: text('prompt_type').notNull(),
  promptContent: text('prompt_content').notNull(),
  promptInstruction: text('prompt_instruction').notNull(),
  promptImageUrl: text('prompt_image_url'),
  promptAudioUrl: text('prompt_audio_url'),
  promptTargetVocabulary: jsonb('prompt_target_vocabulary').$type<string[]>().default([]),
  promptTargetGrammar: jsonb('prompt_target_grammar').$type<string[]>().default([]),
  responseAudioUrl: text('response_audio_url'),
  responseTranscription: text('response_transcription'),
  responseDurationSeconds: real('response_duration_seconds'),
  feedbackJson: jsonb('feedback_json'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
