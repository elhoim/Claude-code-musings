import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  level: number;
  currentXP: number;
  requiredXP: number;
}

export function LevelProgress({ level, currentXP, requiredXP }: Props) {
  const percent = requiredXP > 0 ? Math.min((currentXP / requiredXP) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.level}>Level {level}</Text>
        <Text style={styles.xp}>
          {currentXP} / {requiredXP} XP
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 180,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  level: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  xp: {
    fontSize: 12,
    color: '#6B7280',
  },
  barBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
});
