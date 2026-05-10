import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema.js';
import { SPANISH_A1_UNITS, SPANISH_A1_PLACEMENT_QUESTIONS } from './spanish-a1-content.js';
import { FRENCH_A1_UNITS, FRENCH_A1_PLACEMENT_QUESTIONS } from './french-a1-content.js';
import { FLEMISH_A1_UNITS, FLEMISH_A1_PLACEMENT_QUESTIONS } from './flemish-a1-content.js';
import { ENGLISH_A1_UNITS, ENGLISH_A1_PLACEMENT_QUESTIONS } from './english-a1-content.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_lessons';

async function seed() {
  console.log('Seeding lesson-service database...');

  const connection = postgres(DATABASE_URL);
  const db = drizzle(connection, { schema });

  // Seed units, lessons, and exercises for all languages
  const allUnits = [
    ...SPANISH_A1_UNITS,
    ...FRENCH_A1_UNITS,
    ...FLEMISH_A1_UNITS,
    ...ENGLISH_A1_UNITS,
  ];

  for (const unitData of allUnits) {
    const { lessons: lessonList, ...unitFields } = unitData;

    const [unit] = await db
      .insert(schema.units)
      .values({
        language: unitFields.language,
        cefrLevel: unitFields.cefrLevel,
        title: unitFields.title,
        description: unitFields.description,
        order: unitFields.order,
      })
      .returning();

    console.log(`  Unit: ${unit.title}`);

    for (const lessonData of lessonList) {
      const { exercises: exerciseList, ...lessonFields } = lessonData;

      const [lesson] = await db
        .insert(schema.lessons)
        .values({
          unitId: unit.id,
          language: unitFields.language,
          cefrLevel: unitFields.cefrLevel,
          title: lessonFields.title,
          description: lessonFields.description,
          type: lessonFields.type,
          estimatedMinutes: lessonFields.estimatedMinutes,
          xpReward: lessonFields.xpReward,
          order: lessonFields.order,
        })
        .returning();

      console.log(`    Lesson: ${lesson.title} (${exerciseList.length} exercises)`);

      for (const exerciseData of exerciseList) {
        await db.insert(schema.exercises).values({
          lessonId: lesson.id,
          type: exerciseData.type,
          promptText: exerciseData.promptText,
          correctAnswer: exerciseData.correctAnswer,
          distractors: exerciseData.distractors,
          hints: exerciseData.hints,
          order: exerciseData.order,
        });
      }
    }
  }

  // Seed placement questions for all languages
  const allPlacementQuestions = [
    ...SPANISH_A1_PLACEMENT_QUESTIONS,
    ...FRENCH_A1_PLACEMENT_QUESTIONS,
    ...FLEMISH_A1_PLACEMENT_QUESTIONS,
    ...ENGLISH_A1_PLACEMENT_QUESTIONS,
  ];

  for (const q of allPlacementQuestions) {
    await db.insert(schema.placementQuestions).values({
      language: q.language,
      cefrLevel: q.cefrLevel,
      type: q.type,
      promptText: q.promptText,
      correctAnswer: q.correctAnswer,
      distractors: q.distractors,
    });
  }

  console.log(`  Placement questions: ${allPlacementQuestions.length} inserted`);
  console.log('Lesson service seed complete!');

  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
