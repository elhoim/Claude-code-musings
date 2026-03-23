import { pgTable, uuid, text, integer, timestamp, jsonb, real, uniqueIndex } from 'drizzle-orm/pg-core';

export const grammarNodes = pgTable('grammar_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  language: text('language').notNull(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  nameInTarget: text('name_in_target').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  category: text('category').notNull(),
  shortDescription: text('short_description').notNull(),
  fullExplanation: text('full_explanation'),
  prerequisites: jsonb('prerequisites').$type<string[]>().default([]),
  examples: jsonb('examples').$type<{
    target: string;
    native: string;
    audioUrl?: string;
    highlightRange: [number, number];
    notes?: string;
  }[]>().default([]),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  languageSlugIdx: uniqueIndex('grammar_nodes_language_slug_idx').on(table.language, table.slug),
}));

export const grammarEdges = pgTable('grammar_edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromNodeId: uuid('from_node_id').notNull().references(() => grammarNodes.id),
  toNodeId: uuid('to_node_id').notNull().references(() => grammarNodes.id),
  relationship: text('relationship').notNull().default('prerequisite'),
});

export const userGrammarProgress = pgTable('user_grammar_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  grammarNodeId: uuid('grammar_node_id').notNull().references(() => grammarNodes.id),
  status: text('status').notNull().default('locked'),
  masteryScore: real('mastery_score').notNull().default(0),
  practiceCount: integer('practice_count').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0),
  lastPracticedAt: timestamp('last_practiced_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userNodeIdx: uniqueIndex('user_grammar_progress_user_node_idx').on(table.userId, table.grammarNodeId),
}));
