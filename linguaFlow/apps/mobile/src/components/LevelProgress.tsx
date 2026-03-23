import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { xpProgress } from '@linguaflow/shared';

interface Props {
  totalXp: number;
}

export function LevelProgress({ totalXp }: Props) {
  const { level, current, needed, percent } = xpProgress(totalXp);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.level}>Level {level}</Text>
        <Text style={styles.xp}>{current} / {needed} XP</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  level: { fontSize: 14, fontWeight: '600', color: '#111827' },
  xp: { fontSize: 12, color: '#6B7280' },
  barBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 },
  barFill: { height: 8, backgroundColor: '#2563EB', borderRadius: 4 },
});
