import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface GrammarDetail {
  id: string;
  name: string;
  level: string;
  explanation: string;
  whyImportant: string;
  examples: Array<{ target: string; native: string }>;
}

const PLACEHOLDER_DETAILS: Record<string, GrammarDetail> = {
  g1: {
    id: 'g1',
    name: 'Present Tense (Regular)',
    level: 'A1',
    explanation:
      'Regular verbs in Spanish follow predictable patterns based on their ending: -ar, -er, or -ir. Remove the ending and add the appropriate conjugation suffix for the subject.',
    whyImportant:
      'The present tense is the most frequently used tense in everyday conversation. It forms the foundation for understanding all other tenses.',
    examples: [
      { target: 'Yo hablo español.', native: 'I speak Spanish.' },
      { target: 'Ella come una manzana.', native: 'She eats an apple.' },
      { target: 'Nosotros vivimos en Madrid.', native: 'We live in Madrid.' },
    ],
  },
  g3: {
    id: 'g3',
    name: 'Ser vs Estar',
    level: 'A1',
    explanation:
      'Both "ser" and "estar" mean "to be" but are used differently. "Ser" is for permanent or inherent characteristics (identity, origin, profession). "Estar" is for temporary states, locations, and conditions.',
    whyImportant:
      'Choosing the wrong one can change the meaning entirely. "Es aburrido" (he is boring) vs "Está aburrido" (he is bored).',
    examples: [
      { target: 'Yo soy profesor.', native: 'I am a teacher. (identity)' },
      { target: 'Yo estoy cansado.', native: 'I am tired. (state)' },
      { target: 'La fiesta es en mi casa.', native: 'The party is at my house. (event)' },
    ],
  },
};

const DEFAULT_DETAIL: GrammarDetail = {
  id: 'default',
  name: 'Grammar Concept',
  level: 'A1',
  explanation: 'Detailed explanation coming soon. This grammar concept covers an important aspect of the language.',
  whyImportant: 'Understanding this concept will help you communicate more naturally and accurately.',
  examples: [
    { target: 'Example sentence in target language.', native: 'Translation in your language.' },
  ],
};

export default function GrammarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = PLACEHOLDER_DETAILS[id ?? ''] ?? { ...DEFAULT_DETAIL, id: id ?? 'unknown' };

  const [showWhy, setShowWhy] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.levelBadge}>{detail.level}</Text>
        <Text style={styles.title}>{detail.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Explanation</Text>
        <Text style={styles.explanation}>{detail.explanation}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Examples</Text>
        {detail.examples.map((example, index) => (
          <View key={index} style={styles.exampleRow}>
            <Text style={styles.exampleTarget}>{example.target}</Text>
            <Text style={styles.exampleNative}>{example.native}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.whyButton}
        onPress={() => setShowWhy(!showWhy)}
      >
        <Text style={styles.whyButtonText}>
          {showWhy ? 'Hide' : 'Why is this important?'}
        </Text>
      </TouchableOpacity>

      {showWhy && (
        <View style={styles.whyCard}>
          <Text style={styles.whyText}>{detail.whyImportant}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.practiceButton}
        onPress={() => router.push('/(tabs)/practice')}
      >
        <Text style={styles.practiceButtonText}>Practice This</Text>
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
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  levelBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  explanation: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  exampleRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  exampleTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  exampleNative: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  whyButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  whyButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  whyCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  whyText: {
    fontSize: 15,
    color: '#3730A3',
    lineHeight: 22,
  },
  practiceButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
