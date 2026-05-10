import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

/**
 * Placeholder icon component.
 * Renders the icon name as text inside a sized View.
 * Replace this with a proper icon library (e.g., react-native-vector-icons)
 * when one is added to the project.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
}) => {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.text.default;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      accessibilityLabel={name}
      accessibilityRole="image"
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.45,
            color: iconColor,
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
