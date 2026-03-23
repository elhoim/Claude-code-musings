import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  level: string;
}

const PLACEHOLDER_QUESTIONS: Question[] = [
  {
    id: '1',
    prompt: 'Select the correct translation of "Hello"',
    options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
    correctIndex: 0,
    level: 'A1',
  },
  {
    id: '2',
    prompt: 'Which sentence is grammatically correct?',
    options: [
      'Yo tengo hambre',
      'Yo tiene hambre',
      'Yo tienes hambre',
      'Yo tener hambre',
    ],
    correctIndex: 0,
    level: 'A2',
  },
  {
    id: '3',
    prompt: 'Complete: "Si yo ___ rico, viajaría por el mundo"',
    options: ['fuera', 'soy', 'era', 'seré'],
    correctIndex: 0,
    level: 'B1',
  },
  {
    id: '4',
    prompt: 'What does "echar de menos" mean?',
    options: ['To miss someone', 'To throw away', 'To be less', 'To pour out'],
    correctIndex: 0,
    level: 'B2',
  },
  {
    id: '5',
    prompt: 'Choose the most natural phrasing:',
    options: [
      'No bien hubo llegado, se puso a llover',
      'Cuando llegó, llovió',
      'Al llegar él, la lluvia empezó',
      'Llegando, lloviendo',
    ],
    correctIndex: 0,
    level: 'C1',
  },
];

export default function PlacementTestScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = PLACEHOLDER_QUESTIONS[currentIndex];
  const total = PLACEHOLDER_QUESTIONS.length;

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);

    if (index === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }

    setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  const getLevel = () => {
    if (correctCount >= 5) return 'C1';
    if (correctCount >= 4) return 'B2';
    if (correctCount >= 3) return 'B1';
    if (correctCount >= 2) return 'A2';
    return 'A1';
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Placement Complete!</Text>
          <Text style={styles.resultLevel}>{getLevel()}</Text>
          <Text style={styles.resultDesc}>
            You got {correctCount} out of {total} correct
          </Text>
          <Text style={styles.resultSubtext}>
            We'll start your journey at the {getLevel()} level
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.buttonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
      </View>

      <Text style={styles.counter}>
        Question {currentIndex + 1} of {total}
      </Text>
      <Text style={styles.levelBadge}>{question.level}</Text>

      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          let optionStyle = styles.option;
          if (showFeedback && index === question.correctIndex) {
            optionStyle = { ...styles.option, ...styles.optionCorrect };
          } else if (showFeedback && index === selectedOption && index !== question.correctIndex) {
            optionStyle = { ...styles.option, ...styles.optionWrong };
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              disabled={showFeedback}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 24,
    justifyContent: 'center',
  },
  progress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 24,
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
  },
  levelBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  resultLevel: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
  },
  resultDesc: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
