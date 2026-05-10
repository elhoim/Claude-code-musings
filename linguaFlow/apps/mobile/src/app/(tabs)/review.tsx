import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FlashCard } from '../../components/FlashCard';
import { useSrsStore } from '../../stores/srs.store';

interface Deck {
  id: string;
  name: string;
  dueCount: number;
  totalCards: number;
}

const PLACEHOLDER_DECKS: Deck[] = [
  { id: '1', name: 'Core Vocabulary', dueCount: 12, totalCards: 150 },
  { id: '2', name: 'Grammar Patterns', dueCount: 5, totalCards: 60 },
  { id: '3', name: 'Story Words', dueCount: 8, totalCards: 45 },
  { id: '4', name: 'Phrases & Idioms', dueCount: 0, totalCards: 30 },
];

const PLACEHOLDER_CARDS = [
  { front: 'casa', back: 'house', example: 'Mi casa es grande.' },
  { front: 'perro', back: 'dog', example: 'El perro es amigable.' },
  { front: 'comer', back: 'to eat', example: 'Vamos a comer juntos.' },
];

export default function ReviewScreen() {
  const [reviewing, setReviewing] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const totalDue = PLACEHOLDER_DECKS.reduce((sum, d) => sum + d.dueCount, 0);

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (cardIndex < PLACEHOLDER_CARDS.length - 1) {
      setCardIndex((i) => i + 1);
    } else {
      setReviewing(false);
      setCardIndex(0);
    }
  };

  if (reviewing) {
    const card = PLACEHOLDER_CARDS[cardIndex];
    return (
      <View style={styles.container}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewCounter}>
            {cardIndex + 1} / {PLACEHOLDER_CARDS.length}
          </Text>
          <TouchableOpacity onPress={() => setReviewing(false)}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>
        <FlashCard
          front={card.front}
          back={card.back}
          example={card.example}
          onRate={handleRating}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Review</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryNumber}>{totalDue}</Text>
        <Text style={styles.summaryLabel}>cards due today</Text>
        {totalDue > 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setReviewing(true)}
          >
            <Text style={styles.startButtonText}>Start Review</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Your Decks</Text>
      {PLACEHOLDER_DECKS.map((deck) => (
        <View key={deck.id} style={styles.deckCard}>
          <View>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckInfo}>{deck.totalCards} cards total</Text>
          </View>
          <View style={styles.dueBadge}>
            <Text style={[styles.dueText, deck.dueCount === 0 && styles.dueTextZero]}>
              {deck.dueCount} due
            </Text>
          </View>
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
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  summaryNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#C7D2FE',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  startButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  deckCard: {
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
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deckInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  dueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  dueTextZero: {
    color: '#10B981',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  reviewCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  exitText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
