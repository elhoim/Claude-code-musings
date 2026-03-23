import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  language: text('language').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const unitsRelations = relations(units, ({ many }) => ({
  lessons: many(lessons),
}));

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id')
    .notNull()
    .references(() => units.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull().default(10),
  xpReward: integer('xp_reward').notNull().default(10),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, { fields: [lessons.unitId], references: [units.id] }),
  exercises: many(exercises),
  userLessonProgress: many(userLessonProgress),
}));

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  promptText: text('prompt_text').notNull(),
  promptAudioUrl: text('prompt_audio_url'),
  promptImageUrl: text('prompt_image_url'),
  promptTargetLanguage: boolean('prompt_target_language').notNull().default(false),
  correctAnswer: jsonb('correct_answer').notNull(),
  distractors: jsonb('distractors').$type<string[]>().default([]),
  hints: jsonb('hints').$type<string[]>().default([]),
  order: integer('order').notNull().default(0),
});

export const exercisesRelations = relations(exercises, ({ one }) => ({
  lesson: one(lessons, { fields: [exercises.lessonId], references: [lessons.id] }),
}));

// ---------------------------------------------------------------------------
// Placement Questions
// ---------------------------------------------------------------------------

export const placementQuestions = pgTable('placement_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  language: text('language').notNull(),
  cefrLevel: text('cefr_level').notNull(),
  type: text('type').notNull(),
  promptText: text('prompt_text').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  distractors: jsonb('distractors').$type<string[]>().default([]),
});

// ---------------------------------------------------------------------------
// User Lesson Progress
// ---------------------------------------------------------------------------

export const userLessonProgress = pgTable(
  'user_lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    completed: boolean('completed').notNull().default(false),
    score: real('score').default(0),
    bestScore: real('best_score').default(0),
    attempts: integer('attempts').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userLessonUnique: uniqueIndex('user_lesson_unique_idx').on(table.userId, table.lessonId),
  }),
);

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  lesson: one(lessons, { fields: [userLessonProgress.lessonId], references: [lessons.id] }),
}));
