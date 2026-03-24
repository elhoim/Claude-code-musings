import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema.js';
import { SPANISH_A1_UNITS, SPANISH_A1_PLACEMENT_QUESTIONS } from './spanish-a1-content.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_lessons';

async function seed() {
  console.log('Seeding lesson-service database...');

  const connection = postgres(DATABASE_URL);
  const db = drizzle(connection, { schema });

  // Seed units, lessons, and exercises
  for (const unitData of SPANISH_A1_UNITS) {
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

  // Seed placement questions
  for (const q of SPANISH_A1_PLACEMENT_QUESTIONS) {
    await db.insert(schema.placementQuestions).values({
      language: q.language,
      cefrLevel: q.cefrLevel,
      type: q.type,
      promptText: q.promptText,
      correctAnswer: q.correctAnswer,
      distractors: q.distractors,
    });
  }

  console.log(`  Placement questions: ${SPANISH_A1_PLACEMENT_QUESTIONS.length} inserted`);
  console.log('Lesson service seed complete!');

  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
