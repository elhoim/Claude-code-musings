import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useLearningStore } from '../../stores/learning.store';

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: 'ES' },
  { code: 'fr', name: 'French', flag: 'FR' },
  { code: 'de', name: 'German', flag: 'DE' },
  { code: 'it', name: 'Italian', flag: 'IT' },
  { code: 'pt', name: 'Portuguese', flag: 'PT' },
  { code: 'ja', name: 'Japanese', flag: 'JP' },
  { code: 'ko', name: 'Korean', flag: 'KR' },
  { code: 'zh', name: 'Chinese', flag: 'CN' },
  { code: 'ar', name: 'Arabic', flag: 'AR' },
  { code: 'ru', name: 'Russian', flag: 'RU' },
  { code: 'hi', name: 'Hindi', flag: 'IN' },
  { code: 'tr', name: 'Turkish', flag: 'TR' },
];

export default function LanguageSelectScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const setCurrentLanguage = useLearningStore((s) => s.setCurrentLanguage);

  const handleContinue = () => {
    if (!selected) return;
    setCurrentLanguage(selected);
    router.push('/(onboarding)/goal-setting');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to learn?</Text>
      <Text style={styles.subtitle}>Pick a language to get started</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.card, selected === lang.code && styles.cardSelected]}
            onPress={() => setSelected(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text
              style={[styles.cardText, selected === lang.code && styles.cardTextSelected]}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  flag: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cardTextSelected: {
    color: '#4F46E5',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
