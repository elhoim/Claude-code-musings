import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '../theme';

export interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: RNTextInputProps['style'];
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  multiline = false,
  style,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = error !== undefined && error.length > 0;

  const borderColor = hasError
    ? theme.colors.error.default
    : isFocused
      ? theme.colors.primary.default
      : theme.colors.border.default;

  return (
    <View style={styles.container}>
      {label !== undefined && label.length > 0 && (
        <Text
          style={[
            styles.label,
            {
              fontSize: theme.fontSizes.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.default,
            backgroundColor: theme.colors.background.default,
            borderColor,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.sm + 4,
            paddingVertical: theme.spacing.sm + 2,
          },
          multiline && styles.multiline,
          style,
        ]}
      />
      {hasError && (
        <Text
          style={[
            styles.error,
            {
              fontSize: theme.fontSizes.xs,
              color: theme.colors.error.default,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    fontWeight: '400',
  },
});
