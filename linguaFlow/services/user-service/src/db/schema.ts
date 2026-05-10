import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  nativeLanguage: varchar('native_language', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userLanguageProfiles = pgTable(
  'user_language_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetLanguage: varchar('target_language', { length: 10 }).notNull(),
    overallCefrLevel: varchar('overall_cefr_level', { length: 2 }).notNull().default('A1'),
    readingLevel: varchar('reading_level', { length: 2 }).notNull().default('A1'),
    writingLevel: varchar('writing_level', { length: 2 }).notNull().default('A1'),
    listeningLevel: varchar('listening_level', { length: 2 }).notNull().default('A1'),
    speakingLevel: varchar('speaking_level', { length: 2 }).notNull().default('A1'),
    dailyGoalMinutes: integer('daily_goal_minutes').notNull().default(15),
    streakDays: integer('streak_days').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    totalXp: integer('total_xp').notNull().default(0),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('user_language_unique').on(table.userId, table.targetLanguage)],
);

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  notificationEnabled: boolean('notification_enabled').notNull().default(true),
  notificationTime: varchar('notification_time', { length: 5 }),
  themeMode: varchar('theme_mode', { length: 10 }).notNull().default('system'),
  audioSpeed: real('audio_speed').notNull().default(1.0),
  autoPlayAudio: boolean('auto_play_audio').notNull().default(true),
  showTransliterations: boolean('show_transliterations').notNull().default(true),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  languageProfiles: many(userLanguageProfiles),
  preferences: one(userPreferences),
}));

export const userLanguageProfilesRelations = relations(userLanguageProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userLanguageProfiles.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));
