import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        headerBackVisible: true,
      }}
    >
      <Stack.Screen name="language-select" options={{ title: 'Choose a Language' }} />
      <Stack.Screen name="goal-setting" options={{ title: 'Set Your Goal' }} />
      <Stack.Screen name="placement-test" options={{ title: 'Placement Test' }} />
    </Stack>
  );
}
