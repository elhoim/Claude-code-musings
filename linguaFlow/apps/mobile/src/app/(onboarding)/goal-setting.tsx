import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

const DAILY_GOALS = [
  { minutes: 5, label: 'Casual', description: '5 min/day' },
  { minutes: 10, label: 'Regular', description: '10 min/day' },
  { minutes: 15, label: 'Serious', description: '15 min/day' },
  { minutes: 20, label: 'Intense', description: '20 min/day' },
  { minutes: 30, label: 'Immersive', description: '30 min/day' },
];

const MOTIVATIONS = [
  'Travel',
  'Career',
  'Education',
  'Culture',
  'Family & Friends',
  'Brain Training',
  'Fun',
  'Other',
];

export default function GoalSettingScreen() {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [selectedMotivation, setSelectedMotivation] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGoal === null || !selectedMotivation) return;
    router.push('/(onboarding)/placement-test');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set Your Daily Goal</Text>
      <Text style={styles.subtitle}>How much time can you dedicate each day?</Text>

      <View style={styles.goalsContainer}>
        {DAILY_GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.minutes}
            style={[styles.goalCard, selectedGoal === goal.minutes && styles.goalCardSelected]}
            onPress={() => setSelectedGoal(goal.minutes)}
          >
            <Text
              style={[
                styles.goalLabel,
                selectedGoal === goal.minutes && styles.goalLabelSelected,
              ]}
            >
              {goal.label}
            </Text>
            <Text
              style={[
                styles.goalDesc,
                selectedGoal === goal.minutes && styles.goalDescSelected,
              ]}
            >
              {goal.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Why are you learning?</Text>

      <View style={styles.motivationGrid}>
        {MOTIVATIONS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.motivationChip,
              selectedMotivation === m && styles.motivationChipActive,
            ]}
            onPress={() => setSelectedMotivation(m)}
          >
            <Text
              style={[
                styles.motivationText,
                selectedMotivation === m && styles.motivationTextActive,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (selectedGoal === null || !selectedMotivation) && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={selectedGoal === null || !selectedMotivation}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  goalsContainer: {
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  goalCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  goalLabelSelected: {
    color: '#4F46E5',
  },
  goalDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalDescSelected: {
    color: '#4F46E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  motivationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motivationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  motivationChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  motivationText: {
    fontSize: 14,
    color: '#374151',
  },
  motivationTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
