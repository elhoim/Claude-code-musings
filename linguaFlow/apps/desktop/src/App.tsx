import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * LinguaFlow Desktop App
 *
 * Phase 3 implementation. This skeleton provides the entry point for
 * Windows and macOS builds. Most feature code is shared with the mobile
 * app via @linguaflow/ui and @linguaflow/shared packages.
 *
 * Desktop-specific features:
 * - Wider layout for story reading and grammar graph
 * - Menu bar integration
 * - Keyboard shortcuts
 * - Window size management
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LinguaFlow</Text>
      <Text style={styles.subtitle}>Desktop App — Phase 3</Text>
      <Text style={styles.body}>
        The desktop version shares core functionality with the mobile app.
        Full implementation coming in Phase 3 of development.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 24,
  },
  body: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 480,
    lineHeight: 24,
  },
});
