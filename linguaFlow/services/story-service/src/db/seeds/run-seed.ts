import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../schema.js';
import { SPANISH_A1_STORIES } from './spanish-a1-stories.js';
import { FRENCH_A1_STORIES } from './french-a1-stories.js';
import { FLEMISH_A1_STORIES } from './flemish-a1-stories.js';
import { ENGLISH_A1_STORIES } from './english-a1-stories.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_stories';

async function seed() {
  console.log('Seeding story-service database...');

  const connection = postgres(DATABASE_URL);
  const db = drizzle(connection, { schema });

  const allStories = [
    ...SPANISH_A1_STORIES,
    ...FRENCH_A1_STORIES,
    ...FLEMISH_A1_STORIES,
    ...ENGLISH_A1_STORIES,
  ];

  for (const storyData of allStories) {
    const { segments: segmentList, ...storyFields } = storyData;

    const [story] = await db
      .insert(schema.stories)
      .values({
        language: storyFields.language,
        cefrLevel: storyFields.cefrLevel,
        title: storyFields.title,
        description: storyFields.description,
        genre: storyFields.genre,
        isTemplate: storyFields.isTemplate,
        segmentCount: segmentList.length,
        estimatedMinutes: storyFields.estimatedMinutes,
        vocabularyTargets: storyFields.vocabularyTargets,
        grammarTargets: storyFields.grammarTargets,
      })
      .returning();

    console.log(`  Story: ${story.title} (${segmentList.length} segments)`);

    // First pass: insert all segments to get their IDs
    const orderToId = new Map<number, string>();

    for (const segData of segmentList) {
      const [segment] = await db
        .insert(schema.storySegments)
        .values({
          storyId: story.id,
          order: segData.order,
          text: segData.text,
          translation: segData.translation,
          annotations: segData.annotations,
          choices: null, // inserted in second pass
          promptForUser: segData.promptForUser ?? null,
        })
        .returning();

      orderToId.set(segData.order, segment.id);
    }

    // Second pass: update segments that have choices (resolve order → ID)
    for (const segData of segmentList) {
      if (!segData.choices || segData.choices.length === 0) continue;

      const segmentId = orderToId.get(segData.order);
      if (!segmentId) continue;

      const resolvedChoices = segData.choices.map((c) => ({
        id: c.id,
        text: c.text,
        translation: c.translation,
        nextSegmentId: orderToId.get(c.nextSegmentOrder) ?? '',
      }));

      await db
        .update(schema.storySegments)
        .set({ choices: resolvedChoices })
        .where(eq(schema.storySegments.id, segmentId));
    }

    console.log(`    Choices resolved for story: ${story.title}`);
  }

  console.log('Story service seed complete!');
  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
