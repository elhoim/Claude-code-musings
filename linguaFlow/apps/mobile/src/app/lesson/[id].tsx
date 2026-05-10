import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ExerciseRenderer } from '../../components/ExerciseRenderer';

interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'matching';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  pairs?: Array<{ left: string; right: string }>;
  sentence?: string;
}

const PLACEHOLDER_EXERCISES: Exercise[] = [
  {
    id: '1',
    type: 'multiple-choice',
    prompt: 'What does "rojo" mean?',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    correctAnswer: 'Red',
  },
  {
    id: '2',
    type: 'fill-blank',
    prompt: 'Fill in the blank',
    sentence: 'El cielo es ___.',
    correctAnswer: 'azul',
  },
  {
    id: '3',
    type: 'translation',
    prompt: 'Translate to Spanish: "The house is big"',
    correctAnswer: 'La casa es grande',
  },
  {
    id: '4',
    type: 'multiple-choice',
    prompt: 'Which color is "verde"?',
    options: ['Red', 'Green', 'Blue', 'White'],
    correctAnswer: 'Green',
  },
];

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = PLACEHOLDER_EXERCISES[exerciseIndex];
  const total = PLACEHOLDER_EXERCISES.length;

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (exerciseIndex < total - 1) {
        setExerciseIndex((i) => i + 1);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Lesson Complete!</Text>
          <Text style={styles.resultScore}>
            {score} / {total}
          </Text>
          <Text style={styles.resultLabel}>correct answers</Text>

          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{score * 10} XP</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View
          style={[styles.progressBar, { width: `${((exerciseIndex + 1) / total) * 100}%` }]}
        />
      </View>

      <Text style={styles.counter}>
        Exercise {exerciseIndex + 1} of {total}
      </Text>

      <ExerciseRenderer exercise={exercise} onAnswer={handleAnswer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  progress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  counter: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
  },
  resultLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
