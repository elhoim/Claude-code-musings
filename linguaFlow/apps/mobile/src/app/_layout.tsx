import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/auth.store';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={isAuthenticated} />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" redirect={!isAuthenticated} />
        <Stack.Screen
          name="lesson/[id]"
          options={{ headerShown: true, title: 'Lesson', presentation: 'modal' }}
        />
        <Stack.Screen
          name="story/[id]"
          options={{ headerShown: true, title: 'Story', presentation: 'modal' }}
        />
        <Stack.Screen
          name="grammar/index"
          options={{ headerShown: true, title: 'Grammar Genome' }}
        />
        <Stack.Screen
          name="grammar/[id]"
          options={{ headerShown: true, title: 'Grammar Detail' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
