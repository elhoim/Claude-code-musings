import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import type { Exercise } from '@linguaflow/shared';

interface Props {
  exercise: Exercise;
  onAnswer: (answer: string, correct: boolean) => void;
}

export function ExerciseRenderer({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const correctAnswer = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer[0]
    : exercise.correctAnswer;

  const handleSubmit = () => {
    const answer = exercise.type === 'multiple_choice' ? selected : textAnswer;
    if (!answer) return;
    const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setSubmitted(true);
    onAnswer(answer, correct);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.prompt.text}</Text>

      {exercise.type === 'multiple_choice' && exercise.distractors && (
        <View>
          {[correctAnswer, ...exercise.distractors]
            .sort(() => Math.random() - 0.5)
            .map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  selected === option && styles.selectedOption,
                  submitted && option === correctAnswer && styles.correctOption,
                  submitted && selected === option && option !== correctAnswer && styles.wrongOption,
                ]}
                onPress={() => !submitted && setSelected(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
        </View>
      )}

      {(exercise.type === 'fill_blank' || exercise.type === 'translation' || exercise.type === 'free_write') && (
        <TextInput
          style={styles.input}
          value={textAnswer}
          onChangeText={setTextAnswer}
          placeholder="Type your answer..."
          editable={!submitted}
          autoCapitalize="none"
        />
      )}

      {!submitted && (
        <Pressable
          style={[styles.submitButton, !(selected || textAnswer) && styles.disabled]}
          onPress={handleSubmit}
          disabled={!(selected || textAnswer)}
        >
          <Text style={styles.submitText}>Check</Text>
        </Pressable>
      )}

      {exercise.hints && exercise.hints.length > 0 && !submitted && (
        <Text style={styles.hint}>Hint: {exercise.hints[0]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  prompt: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20, lineHeight: 26 },
  option: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, marginBottom: 10,
  },
  selectedOption: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  correctOption: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  wrongOption: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optionText: { fontSize: 16, color: '#374151' },
  input: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 10, padding: 14,
    fontSize: 16, color: '#111827', marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2563EB', borderRadius: 10, padding: 14, alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, color: '#9CA3AF', marginTop: 12, fontStyle: 'italic' },
});
