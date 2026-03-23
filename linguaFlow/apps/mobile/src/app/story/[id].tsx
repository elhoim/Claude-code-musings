import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface WordAnnotation {
  word: string;
  translation: string;
  partOfSpeech: string;
}

interface StorySegment {
  id: string;
  text: string;
  annotations: WordAnnotation[];
  choices?: Array<{ text: string; nextSegmentId: string }>;
}

const PLACEHOLDER_SEGMENTS: StorySegment[] = [
  {
    id: '1',
    text: 'María caminaba por el mercado buscando frutas frescas. El sol brillaba y había mucha gente.',
    annotations: [
      { word: 'caminaba', translation: 'was walking', partOfSpeech: 'verb (imperfect)' },
      { word: 'mercado', translation: 'market', partOfSpeech: 'noun' },
      { word: 'frescas', translation: 'fresh', partOfSpeech: 'adjective' },
      { word: 'brillaba', translation: 'was shining', partOfSpeech: 'verb (imperfect)' },
    ],
    choices: [
      { text: 'She went to the fruit stand', nextSegmentId: '2' },
      { text: 'She stopped to talk to a friend', nextSegmentId: '3' },
    ],
  },
  {
    id: '2',
    text: 'Se acercó al puesto de frutas. "Buenos días, señora," dijo el vendedor. "¿Qué le puedo ofrecer hoy?"',
    annotations: [
      { word: 'puesto', translation: 'stand/stall', partOfSpeech: 'noun' },
      { word: 'vendedor', translation: 'vendor', partOfSpeech: 'noun' },
      { word: 'ofrecer', translation: 'to offer', partOfSpeech: 'verb' },
    ],
  },
  {
    id: '3',
    text: '"¡Hola, Ana!" exclamó María. "¡Cuánto tiempo sin verte!" Las dos amigas se abrazaron.',
    annotations: [
      { word: 'exclamó', translation: 'exclaimed', partOfSpeech: 'verb (preterite)' },
      { word: 'sin verte', translation: 'without seeing you', partOfSpeech: 'phrase' },
      { word: 'abrazaron', translation: 'hugged', partOfSpeech: 'verb (preterite)' },
    ],
  },
];

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<WordAnnotation | null>(null);
  const [readSegments, setReadSegments] = useState<string[]>(['1']);

  const segment = PLACEHOLDER_SEGMENTS[currentSegmentIndex];

  const handleWordTap = (word: string) => {
    const annotation = segment.annotations.find(
      (a) => word.toLowerCase().includes(a.word.toLowerCase())
    );
    if (annotation) {
      setSelectedWord(annotation);
    }
  };

  const handleChoice = (nextSegmentId: string) => {
    const nextIndex = PLACEHOLDER_SEGMENTS.findIndex((s) => s.id === nextSegmentId);
    if (nextIndex >= 0) {
      setCurrentSegmentIndex(nextIndex);
      setReadSegments((prev) => [...prev, nextSegmentId]);
    }
  };

  const words = segment.text.split(/(\s+)/);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.chapterTitle}>Chapter {id} - The Market</Text>

        <View style={styles.segmentProgress}>
          <Text style={styles.segmentCounter}>
            Segment {currentSegmentIndex + 1} of {PLACEHOLDER_SEGMENTS.length}
          </Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.storyText}>
            {words.map((word, index) => {
              const isAnnotated = segment.annotations.some(
                (a) => word.toLowerCase().includes(a.word.toLowerCase())
              );
              return (
                <Text
                  key={index}
                  style={isAnnotated ? styles.annotatedWord : undefined}
                  onPress={() => handleWordTap(word)}
                >
                  {word}
                </Text>
              );
            })}
          </Text>
        </View>

        {segment.choices && (
          <View style={styles.choicesSection}>
            <Text style={styles.choicesTitle}>What happens next?</Text>
            {segment.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={styles.choiceButton}
                onPress={() => handleChoice(choice.nextSegmentId)}
              >
                <Text style={styles.choiceText}>{choice.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!segment.choices && currentSegmentIndex < PLACEHOLDER_SEGMENTS.length - 1 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              setCurrentSegmentIndex((i) => i + 1);
            }}
          >
            <Text style={styles.continueText}>Continue Reading</Text>
          </TouchableOpacity>
        )}

        {!segment.choices && currentSegmentIndex === PLACEHOLDER_SEGMENTS.length - 1 && (
          <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
            <Text style={styles.continueText}>Finish Story</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={selectedWord !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelectedWord(null)}
        >
          <View style={styles.annotationCard}>
            {selectedWord && (
              <>
                <Text style={styles.annotationWord}>{selectedWord.word}</Text>
                <Text style={styles.annotationPos}>{selectedWord.partOfSpeech}</Text>
                <Text style={styles.annotationTranslation}>{selectedWord.translation}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF0',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  segmentProgress: {
    alignItems: 'center',
  },
  segmentCounter: {
    fontSize: 13,
    color: '#6B7280',
  },
  textBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  storyText: {
    fontSize: 18,
    lineHeight: 30,
    color: '#1F2937',
  },
  annotatedWord: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  choicesSection: {
    gap: 10,
  },
  choicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  choiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  choiceText: {
    fontSize: 16,
    color: '#374151',
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  annotationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  annotationWord: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  annotationPos: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  annotationTranslation: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
});
