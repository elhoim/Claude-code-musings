import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { CardContent, ReviewRating } from '@linguaflow/shared';

interface Props {
  front: CardContent;
  back: CardContent;
  onRate: (rating: ReviewRating) => void;
}

const RATING_CONFIG = [
  { rating: 1 as ReviewRating, label: 'Again', color: '#EF4444' },
  { rating: 2 as ReviewRating, label: 'Hard', color: '#F59E0B' },
  { rating: 3 as ReviewRating, label: 'Good', color: '#22C55E' },
  { rating: 4 as ReviewRating, label: 'Easy', color: '#2563EB' },
];

export function FlashCard({ front, back, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={() => setFlipped(!flipped)}>
        {!flipped ? (
          <View style={styles.cardContent}>
            <Text style={styles.label}>{front.type === 'sentence' ? 'Sentence' : 'Word'}</Text>
            <Text style={styles.primaryText}>{front.primary}</Text>
            {front.context && <Text style={styles.context}>{front.context}</Text>}
            <Text style={styles.tapHint}>Tap to flip</Text>
          </View>
        ) : (
          <View style={styles.cardContent}>
            <Text style={styles.label}>Answer</Text>
            <Text style={styles.primaryText}>{back.primary}</Text>
            {back.secondary && <Text style={styles.secondary}>{back.secondary}</Text>}
            {back.context && <Text style={styles.context}>{back.context}</Text>}
          </View>
        )}
      </Pressable>

      {flipped && (
        <View style={styles.ratingRow}>
          {RATING_CONFIG.map(({ rating, label, color }) => (
            <Pressable
              key={rating}
              style={[styles.ratingButton, { backgroundColor: color }]}
              onPress={() => { onRate(rating); setFlipped(false); }}
            >
              <Text style={styles.ratingText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, width: '100%',
    minHeight: 220, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 20,
  },
  cardContent: { alignItems: 'center' },
  label: { fontSize: 12, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase' },
  primaryText: { fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center' },
  secondary: { fontSize: 16, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  context: { fontSize: 14, color: '#9CA3AF', marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
  tapHint: { fontSize: 12, color: '#D1D5DB', marginTop: 20 },
  ratingRow: { flexDirection: 'row', gap: 8, width: '100%' },
  ratingButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  ratingText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});
