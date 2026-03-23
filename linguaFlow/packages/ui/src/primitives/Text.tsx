import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type TextVariant = 'heading' | 'subheading' | 'body' | 'caption' | 'label';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: TextWeight;
  align?: TextAlign;
  children: React.ReactNode;
  style?: RNTextProps['style'];
  numberOfLines?: number;
}

const weightMap: Record<TextWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  weight,
  align,
  children,
  style,
  numberOfLines,
}) => {
  const theme = useTheme();

  const variantStyles: Record<TextVariant, TextStyle> = {
    heading: {
      fontSize: theme.fontSizes.xxxl,
      fontWeight: '700',
      color: theme.colors.text.default,
      lineHeight: theme.fontSizes.xxxl * 1.3,
    },
    subheading: {
      fontSize: theme.fontSizes.xl,
      fontWeight: '600',
      color: theme.colors.text.default,
      lineHeight: theme.fontSizes.xl * 1.4,
    },
    body: {
      fontSize: theme.fontSizes.md,
      fontWeight: '400',
      color: theme.colors.text.default,
      lineHeight: theme.fontSizes.md * 1.5,
    },
    caption: {
      fontSize: theme.fontSizes.sm,
      fontWeight: '400',
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.sm * 1.4,
    },
    label: {
      fontSize: theme.fontSizes.sm,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.sm * 1.4,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        currentVariant,
        color !== undefined && { color },
        weight !== undefined && { fontWeight: weightMap[weight] },
        align !== undefined && { textAlign: align },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};
