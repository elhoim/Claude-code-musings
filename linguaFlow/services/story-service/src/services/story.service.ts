import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/client';
import { stories, storySegments, userStoryState } from '../db/schema';

export async function getStories(language: string) {
  const result = await db
    .select()
    .from(stories)
    .where(eq(stories.language, language))
    .orderBy(asc(stories.createdAt));

  return result;
}

export async function getStory(storyId: string) {
  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, storyId));

  if (!story) return null;

  const segments = await db
    .select()
    .from(storySegments)
    .where(eq(storySegments.storyId, storyId))
    .orderBy(asc(storySegments.order));

  return { ...story, segments };
}

export async function getStoryState(userId: string, storyId: string) {
  const [state] = await db
    .select()
    .from(userStoryState)
    .where(
      and(
        eq(userStoryState.userId, userId),
        eq(userStoryState.storyId, storyId),
      ),
    );

  return state || null;
}

export async function startStory(userId: string, storyId: string) {
  // Get the first segment of the story
  const [firstSegment] = await db
    .select()
    .from(storySegments)
    .where(eq(storySegments.storyId, storyId))
    .orderBy(asc(storySegments.order))
    .limit(1);

  if (!firstSegment) {
    throw new Error('Story has no segments');
  }

  // Check if user already has state for this story
  const existing = await getStoryState(userId, storyId);
  if (existing) {
    return existing;
  }

  const [state] = await db
    .insert(userStoryState)
    .values({
      userId,
      storyId,
      currentSegmentId: firstSegment.id,
      choiceHistory: [],
      completedSegments: 0,
      startedAt: new Date(),
      lastReadAt: new Date(),
    })
    .returning();

  return state;
}

export async function makeChoice(userId: string, storyId: string, choiceId: string) {
  const state = await getStoryState(userId, storyId);
  if (!state) {
    throw new Error('No active story state found');
  }

  // Get current segment to find the choice
  const [currentSegment] = await db
    .select()
    .from(storySegments)
    .where(eq(storySegments.id, state.currentSegmentId));

  if (!currentSegment || !currentSegment.choices) {
    throw new Error('Current segment has no choices');
  }

  const choices = currentSegment.choices as { id: string; text: string; translation: string; nextSegmentId: string; requiresLevel?: string }[];
  const selectedChoice = choices.find((c) => c.id === choiceId);
  if (!selectedChoice) {
    throw new Error('Invalid choice');
  }

  const updatedHistory = [...(state.choiceHistory || []), choiceId];

  const [updated] = await db
    .update(userStoryState)
    .set({
      currentSegmentId: selectedChoice.nextSegmentId,
      choiceHistory: updatedHistory,
      completedSegments: state.completedSegments + 1,
      lastReadAt: new Date(),
    })
    .where(eq(userStoryState.id, state.id))
    .returning();

  return updated;
}

export async function getNextSegment(storyId: string, currentSegmentId: string, choiceId?: string) {
  if (choiceId) {
    // Get current segment's choices to find next segment
    const [currentSegment] = await db
      .select()
      .from(storySegments)
      .where(eq(storySegments.id, currentSegmentId));

    if (currentSegment?.choices) {
      const choices = currentSegment.choices as { id: string; nextSegmentId: string }[];
      const choice = choices.find((c) => c.id === choiceId);
      if (choice) {
        const [nextSegment] = await db
          .select()
          .from(storySegments)
          .where(eq(storySegments.id, choice.nextSegmentId));
        return nextSegment || null;
      }
    }
  }

  // If no choice, get the next segment by order
  const [currentSegment] = await db
    .select()
    .from(storySegments)
    .where(eq(storySegments.id, currentSegmentId));

  if (!currentSegment) return null;

  const [nextSegment] = await db
    .select()
    .from(storySegments)
    .where(
      and(
        eq(storySegments.storyId, storyId),
      ),
    )
    .orderBy(asc(storySegments.order));

  // Find the segment with the next order
  const allSegments = await db
    .select()
    .from(storySegments)
    .where(eq(storySegments.storyId, storyId))
    .orderBy(asc(storySegments.order));

  const currentIndex = allSegments.findIndex((s) => s.id === currentSegmentId);
  if (currentIndex === -1 || currentIndex >= allSegments.length - 1) {
    return null;
  }

  return allSegments[currentIndex + 1];
}
