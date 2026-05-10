import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'matching';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  pairs?: Array<{ left: string; right: string }>;
  sentence?: string;
}

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}

export function ExerciseRenderer({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (submitted) return;

    let correct = false;
    if (exercise.type === 'multiple-choice') {
      correct = selected === exercise.correctAnswer;
    } else {
      correct =
        textAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.prompt}</Text>

      {exercise.type === 'multiple-choice' && exercise.options && (
        <View style={styles.options}>
          {exercise.options.map((option) => {
            let optionStyle = [styles.option];
            if (submitted && option === exercise.correctAnswer) {
              optionStyle = [styles.option, styles.correctOption];
            } else if (submitted && selected === option && option !== exercise.correctAnswer) {
              optionStyle = [styles.option, styles.wrongOption];
            } else if (selected === option) {
              optionStyle = [styles.option, styles.selectedOption];
            }

            return (
              <TouchableOpacity
                key={option}
                style={optionStyle}
                onPress={() => handleOptionSelect(option)}
                disabled={submitted}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {exercise.type === 'fill-blank' && (
        <View style={styles.fillBlankContainer}>
          {exercise.sentence && (
            <Text style={styles.sentence}>
              {exercise.sentence.replace('___', submitted ? exercise.correctAnswer : '___')}
            </Text>
          )}
          <TextInput
            style={styles.input}
            value={textAnswer}
            onChangeText={setTextAnswer}
            placeholder="Type the missing word..."
            autoCapitalize="none"
            editable={!submitted}
          />
        </View>
      )}

      {exercise.type === 'translation' && (
        <TextInput
          style={styles.input}
          value={textAnswer}
          onChangeText={setTextAnswer}
          placeholder="Type your translation..."
          autoCapitalize="none"
          editable={!submitted}
          multiline
        />
      )}

      {exercise.type === 'matching' && exercise.pairs && (
        <View style={styles.matchingContainer}>
          <Text style={styles.matchingNote}>Matching exercises coming soon</Text>
          {exercise.pairs.map((pair, index) => (
            <View key={index} style={styles.pairRow}>
              <Text style={styles.pairLeft}>{pair.left}</Text>
              <Text style={styles.pairArrow}>-</Text>
              <Text style={styles.pairRight}>{pair.right}</Text>
            </View>
          ))}
        </View>
      )}

      {submitted && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Correct!' : `Incorrect. Answer: ${exercise.correctAnswer}`}
          </Text>
        </View>
      )}

      {!submitted && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            !(selected || textAnswer) && styles.disabled,
          ]}
          onPress={handleSubmit}
          disabled={!(selected || textAnswer)}
        >
          <Text style={styles.submitText}>Check</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  options: {
    gap: 10,
  },
  option: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  wrongOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  fillBlankContainer: {
    gap: 12,
  },
  sentence: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 26,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  matchingContainer: {
    gap: 8,
  },
  matchingNote: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  pairLeft: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  pairArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  pairRight: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'right',
  },
  feedback: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#ECFDF5',
  },
  feedbackWrong: {
    backgroundColor: '#FEF2F2',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
