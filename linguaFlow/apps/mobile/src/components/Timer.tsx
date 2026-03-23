import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  totalSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
}

export function Timer({ totalSeconds, isRunning, onComplete }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete]);

  const progress = remaining / totalSeconds;
  const color = progress > 0.5 ? '#2563EB' : progress > 0.25 ? '#F59E0B' : '#EF4444';

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color }]}>{remaining}s</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 20 },
  time: { fontSize: 42, fontWeight: '700', marginBottom: 8 },
  barBg: { width: '100%', height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
});
