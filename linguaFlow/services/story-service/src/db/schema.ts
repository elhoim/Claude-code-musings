import { pgTable, uuid, text, integer, timestamp, jsonb, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const stories = pgTable('stories', {
  id: uuid('id').primaryKey().defaultRandom(),
  language: text('language').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  genre: text('genre').notNull(),
  coverImageUrl: text('cover_image_url'),
  isTemplate: boolean('is_template').notNull().default(true),
  segmentCount: integer('segment_count').notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull(),
  vocabularyTargets: jsonb('vocabulary_targets').$type<string[]>().default([]),
  grammarTargets: jsonb('grammar_targets').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storySegments = pgTable('story_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id').notNull().references(() => stories.id),
  order: integer('order').notNull(),
  text: text('text').notNull(),
  translation: text('translation').notNull(),
  audioUrl: text('audio_url'),
  annotations: jsonb('annotations').$type<{
    startIndex: number;
    endIndex: number;
    word: string;
    definition: string;
    pronunciation?: string;
    partOfSpeech?: string;
    grammarNodeId?: string;
  }[]>().default([]),
  choices: jsonb('choices').$type<{
    id: string;
    text: string;
    translation: string;
    nextSegmentId: string;
    requiresLevel?: string;
  }[] | null>(),
  promptForUser: jsonb('prompt_for_user').$type<{
    type: string;
    instruction: string;
    minWords?: number;
  } | null>(),
});

export const userStoryState = pgTable('user_story_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id),
  currentSegmentId: uuid('current_segment_id').notNull(),
  choiceHistory: jsonb('choice_history').$type<string[]>().default([]),
  completedSegments: integer('completed_segments').notNull().default(0),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userStoryIdx: uniqueIndex('user_story_state_user_story_idx').on(table.userId, table.storyId),
}));
