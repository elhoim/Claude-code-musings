import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface WindowSizeManagerProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Manages responsive layout for desktop window sizes.
 * Centers content with a max-width constraint for readability on large screens.
 */
export function WindowSizeManager({
  children,
  minWidth = 800,
  maxWidth = 1200,
}: WindowSizeManagerProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(Math.max(width, minWidth), maxWidth);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { width: contentWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});
