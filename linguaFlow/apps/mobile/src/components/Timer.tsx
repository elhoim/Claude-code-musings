import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  seconds: number;
  isRunning: boolean;
  onComplete: () => void;
}

export function Timer({ seconds, isRunning, onComplete }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          stableOnComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining, stableOnComplete]);

  const progress = remaining / seconds;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${minutes}:${secs.toString().padStart(2, '0')}`;

  const color = progress > 0.5 ? '#4F46E5' : progress > 0.25 ? '#F59E0B' : '#EF4444';

  // Circular progress placeholder (using bar for now)
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={[styles.time, { color }]}>{display}</Text>
      </View>
      <View style={styles.barBg}>
        <View
          style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
  },
  barBg: {
    width: 80,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});
