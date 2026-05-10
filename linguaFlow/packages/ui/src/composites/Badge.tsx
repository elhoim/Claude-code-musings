import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'info',
  size = 'md',
}) => {
  const theme = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    success: {
      bg: '#DCFCE7',
      text: '#166534',
    },
    warning: {
      bg: '#FEF3C7',
      text: '#92400E',
    },
    error: {
      bg: '#FEE2E2',
      text: '#991B1B',
    },
    info: {
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
  };

  const sizeStyles: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingHorizontal: theme.spacing.xs + 2,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
      },
      text: {
        fontSize: theme.fontSizes.xs,
      },
    },
    md: {
      container: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
      },
      text: {
        fontSize: theme.fontSizes.sm,
      },
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        { backgroundColor: currentVariant.bg },
      ]}
    >
      <Text
        style={[
          styles.text,
          currentSize.text,
          { color: currentVariant.text },
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
