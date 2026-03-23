import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Timer } from '../../components/Timer';

interface DrillQuestion {
  prompt: string;
  type: 'translate' | 'fill-blank';
  answer: string;
}

const PLACEHOLDER_DRILL: DrillQuestion[] = [
  { prompt: 'Translate: "The cat is on the table"', type: 'translate', answer: 'El gato está en la mesa' },
  { prompt: 'Fill in: "Yo ___ español" (hablar, present)', type: 'fill-blank', answer: 'hablo' },
  { prompt: 'Translate: "I want to eat"', type: 'translate', answer: 'Quiero comer' },
  { prompt: 'Fill in: "Ella ___ muy contenta" (estar, present)', type: 'fill-blank', answer: 'está' },
  { prompt: 'Translate: "Where is the library?"', type: 'translate', answer: '¿Dónde está la biblioteca?' },
];

export default function PracticeScreen() {
  const [drillActive, setDrillActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = PLACEHOLDER_DRILL[questionIndex];

  const startDrill = () => {
    setDrillActive(true);
    setQuestionIndex(0);
    setUserInput('');
    setShowAnswer(false);
    setScore(0);
    setTimerRunning(true);
    setFinished(false);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
    const isCorrect = userInput.trim().toLowerCase() === question.answer.toLowerCase();
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (questionIndex < PLACEHOLDER_DRILL.length - 1) {
      setQuestionIndex((i) => i + 1);
      setUserInput('');
      setShowAnswer(false);
    } else {
      setTimerRunning(false);
      setFinished(true);
    }
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    setFinished(true);
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Drill Complete!</Text>
          <Text style={styles.resultScore}>
            {score} / {PLACEHOLDER_DRILL.length}
          </Text>
          <Text style={styles.resultLabel}>correct answers</Text>
          <TouchableOpacity style={styles.button} onPress={startDrill}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setDrillActive(false);
              setFinished(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (drillActive) {
    return (
      <View style={styles.container}>
        <View style={styles.drillHeader}>
          <Text style={styles.drillCounter}>
            {questionIndex + 1} / {PLACEHOLDER_DRILL.length}
          </Text>
          <Timer seconds={120} onComplete={handleTimerComplete} isRunning={timerRunning} />
        </View>

        <View style={styles.drillContent}>
          <Text style={styles.drillPrompt}>{question.prompt}</Text>

          <TextInput
            style={styles.drillInput}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your answer..."
            autoCapitalize="none"
            editable={!showAnswer}
          />

          {showAnswer && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Correct answer:</Text>
              <Text style={styles.answerText}>{question.answer}</Text>
            </View>
          )}

          {!showAnswer ? (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {questionIndex < PLACEHOLDER_DRILL.length - 1 ? 'Next' : 'Finish'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Pressure Cooker</Text>
      <Text style={styles.subtitle}>
        Timed drills to build speed and accuracy under pressure
      </Text>

      <View style={styles.modeCard}>
        <Text style={styles.modeTitle}>Mode 1: Quick Fire</Text>
        <Text style={styles.modeDesc}>
          Answer as many questions as possible in 2 minutes. Mix of translation and fill-in-the-blank exercises.
        </Text>
        <TouchableOpacity style={styles.button} onPress={startDrill}>
          <Text style={styles.buttonText}>Start Drill</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.modeCard, styles.modeCardLocked]}>
        <Text style={styles.modeTitle}>Mode 2: Listening Sprint</Text>
        <Text style={styles.modeDesc}>Coming in Phase 2</Text>
      </View>

      <View style={[styles.modeCard, styles.modeCardLocked]}>
        <Text style={styles.modeTitle}>Mode 3: Grammar Gauntlet</Text>
        <Text style={styles.modeDesc}>Coming in Phase 3</Text>
      </View>
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
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modeCardLocked: {
    opacity: 0.5,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modeDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  drillCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  drillContent: {
    padding: 20,
    gap: 16,
    flex: 1,
  },
  drillPrompt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  drillInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  answerBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  answerText: {
    fontSize: 16,
    color: '#065F46',
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    margin: 20,
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 24,
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
    marginBottom: 16,
  },
});
