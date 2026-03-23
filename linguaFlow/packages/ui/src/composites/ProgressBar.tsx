import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

export interface ProgressBarProps {
  /** Progress value between 0 and 1 */
  progress: number;
  color?: string;
  label?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  label,
  height = 8,
}) => {
  const theme = useTheme();
  const barColor = color ?? theme.colors.primary.default;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const animatedWidth = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, animatedWidth]);

  return (
    <View style={styles.container}>
      {label !== undefined && label.length > 0 && (
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              {
                fontSize: theme.fontSizes.sm,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.percentage,
              {
                fontSize: theme.fontSizes.sm,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {Math.round(clampedProgress * 100)}%
          </Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: theme.colors.background.subtle,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: barColor,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '500',
  },
  percentage: {
    fontWeight: '500',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
