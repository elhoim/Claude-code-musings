import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface Props {
  front: string;
  back: string;
  example?: string;
  onRate: (rating: ReviewRating) => void;
}

const RATING_CONFIG: Array<{ rating: ReviewRating; label: string; color: string }> = [
  { rating: 'again', label: 'Again', color: '#EF4444' },
  { rating: 'hard', label: 'Hard', color: '#F59E0B' },
  { rating: 'good', label: 'Good', color: '#22C55E' },
  { rating: 'easy', label: 'Easy', color: '#4F46E5' },
];

export function FlashCard({ front, back, example, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleRate = (rating: ReviewRating) => {
    onRate(rating);
    setFlipped(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.9}
      >
        {!flipped ? (
          <View style={styles.cardContent}>
            <Text style={styles.label}>Front</Text>
            <Text style={styles.primaryText}>{front}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </View>
        ) : (
          <View style={styles.cardContent}>
            <Text style={styles.label}>Back</Text>
            <Text style={styles.primaryText}>{back}</Text>
            {example && <Text style={styles.example}>{example}</Text>}
          </View>
        )}
      </TouchableOpacity>

      {flipped && (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingPrompt}>How well did you know this?</Text>
          <View style={styles.ratingRow}>
            {RATING_CONFIG.map(({ rating, label, color }) => (
              <TouchableOpacity
                key={rating}
                style={[styles.ratingButton, { backgroundColor: color }]}
                onPress={() => handleRate(rating)}
              >
                <Text style={styles.ratingText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  primaryText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  example: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  tapHint: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 16,
  },
  ratingSection: {
    width: '100%',
    marginTop: 24,
    gap: 8,
  },
  ratingPrompt: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
