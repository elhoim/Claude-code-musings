import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------------

export const decks = pgTable('decks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  languageProfileId: uuid('language_profile_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
}));

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  languageProfileId: uuid('language_profile_id').notNull(),

  // Front side
  frontType: text('front_type').notNull(),
  frontPrimary: text('front_primary').notNull(),
  frontSecondary: text('front_secondary'),
  frontAudioUrl: text('front_audio_url'),
  frontImageUrl: text('front_image_url'),
  frontContext: text('front_context'),

  // Back side
  backType: text('back_type').notNull(),
  backPrimary: text('back_primary').notNull(),
  backSecondary: text('back_secondary'),
  backAudioUrl: text('back_audio_url'),
  backImageUrl: text('back_image_url'),
  backContext: text('back_context'),

  // FSRS scheduling fields
  stability: real('stability').notNull().default(0),
  difficulty: real('difficulty').notNull().default(0),
  elapsedDays: integer('elapsed_days').notNull().default(0),
  scheduledDays: integer('scheduled_days').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  state: text('state').notNull().default('new'),
  dueDate: timestamp('due_date', { withTimezone: true }).defaultNow().notNull(),
  lastReview: timestamp('last_review', { withTimezone: true }),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, { fields: [cards.deckId], references: [decks.id] }),
  reviewLogs: many(reviewLogs),
}));

// ---------------------------------------------------------------------------
// Review Logs
// ---------------------------------------------------------------------------

export const reviewLogs = pgTable('review_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  rating: integer('rating').notNull(),
  reviewDurationMs: integer('review_duration_ms'),
  scheduledDays: integer('scheduled_days').notNull(),
  elapsedDays: integer('elapsed_days').notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
  card: one(cards, { fields: [reviewLogs.cardId], references: [cards.id] }),
}));
