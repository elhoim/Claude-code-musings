import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
}

interface Unit {
  level: string;
  title: string;
  lessons: Lesson[];
}

const PLACEHOLDER_PATH: Unit[] = [
  {
    level: 'A1',
    title: 'Foundations',
    lessons: [
      { id: '1', title: 'Greetings & Introductions', description: 'Learn basic greetings', status: 'completed' },
      { id: '2', title: 'Numbers & Counting', description: 'Count from 1 to 100', status: 'completed' },
      { id: '3', title: 'Colors & Descriptions', description: 'Describe things around you', status: 'in-progress' },
      { id: '4', title: 'Family Members', description: 'Talk about your family', status: 'locked' },
    ],
  },
  {
    level: 'A2',
    title: 'Elementary',
    lessons: [
      { id: '5', title: 'Daily Routines', description: 'Describe your typical day', status: 'locked' },
      { id: '6', title: 'Food & Ordering', description: 'Order food at a restaurant', status: 'locked' },
      { id: '7', title: 'Directions & Places', description: 'Navigate a city', status: 'locked' },
    ],
  },
  {
    level: 'B1',
    title: 'Intermediate',
    lessons: [
      { id: '8', title: 'Past Tense Stories', description: 'Tell stories about the past', status: 'locked' },
      { id: '9', title: 'Opinions & Arguments', description: 'Express your views', status: 'locked' },
    ],
  },
];

function StatusIndicator({ status }: { status: Lesson['status'] }) {
  const colors = {
    completed: '#10B981',
    'in-progress': '#F59E0B',
    locked: '#D1D5DB',
  };
  const labels = {
    completed: 'Done',
    'in-progress': 'Current',
    locked: 'Locked',
  };
  return (
    <View style={[styles.statusDot, { backgroundColor: colors[status] }]}>
      <Text style={styles.statusText}>{labels[status]}</Text>
    </View>
  );
}

export default function LearnScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Learning Path</Text>

      {PLACEHOLDER_PATH.map((unit) => (
        <View key={unit.level} style={styles.unit}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitLevel}>{unit.level}</Text>
            <Text style={styles.unitTitle}>{unit.title}</Text>
          </View>

          {unit.lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonCard, lesson.status === 'locked' && styles.lessonLocked]}
              onPress={() => {
                if (lesson.status !== 'locked') {
                  router.push(`/lesson/${lesson.id}`);
                }
              }}
              disabled={lesson.status === 'locked'}
            >
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDesc}>{lesson.description}</Text>
              </View>
              <StatusIndicator status={lesson.status} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  unit: {
    gap: 10,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  lessonDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusDot: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
