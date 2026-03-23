import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import type { Spacing } from '../theme/tokens';

export interface CardProps {
  children: React.ReactNode;
  padding?: keyof Spacing;
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  elevated = false,
  onPress,
  style,
}) => {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[padding],
    ...(elevated ? theme.shadows.card : {}),
    ...(!elevated
      ? {
          borderWidth: 1,
          borderColor: theme.colors.border.default,
        }
      : {}),
  };

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },
});
