import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  streak: number;
  size?: 'small' | 'large';
}

export function StreakBadge({ streak, size = 'small' }: Props) {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={[styles.flame, isLarge && styles.flameLarge]}>
        {streak > 0 ? '\u{1F525}' : '\u{2744}\u{FE0F}'}
      </Text>
      <Text style={[styles.count, isLarge && styles.countLarge]}>{streak}</Text>
      {isLarge && <Text style={styles.label}>day streak</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  containerLarge: { flexDirection: 'column', alignItems: 'center', gap: 2 },
  flame: { fontSize: 16 },
  flameLarge: { fontSize: 32 },
  count: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  countLarge: { fontSize: 28, fontWeight: '700', color: '#F59E0B' },
  label: { fontSize: 12, color: '#9CA3AF' },
});
