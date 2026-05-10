import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: PressableProps['style'];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
      },
      text: { fontSize: theme.fontSizes.sm },
    },
    md: {
      container: {
        paddingVertical: theme.spacing.sm + 2,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
      },
      text: { fontSize: theme.fontSizes.md },
    },
    lg: {
      container: {
        paddingVertical: theme.spacing.md - 2,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
      },
      text: { fontSize: theme.fontSizes.lg },
    },
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: theme.colors.primary.default,
      },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.secondary.default,
      },
      text: { color: '#FFFFFF' },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary.default,
      },
      text: { color: theme.colors.primary.default },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: { color: theme.colors.primary.default },
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];
  const indicatorColor = variant === 'outline' || variant === 'ghost'
    ? theme.colors.primary.default
    : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        currentSize.container,
        currentVariant.container,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <Text style={[styles.text, currentSize.text, currentVariant.text]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
