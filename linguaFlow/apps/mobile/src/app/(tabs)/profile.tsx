import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { StreakBadge } from '../../components/StreakBadge';
import { LevelProgress } from '../../components/LevelProgress';

const SKILLS = [
  { name: 'Reading', value: 0.7 },
  { name: 'Writing', value: 0.5 },
  { name: 'Listening', value: 0.4 },
  { name: 'Speaking', value: 0.3 },
  { name: 'Grammar', value: 0.6 },
  { name: 'Vocabulary', value: 0.8 },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{user?.displayName ?? 'Learner'}</Text>
        <Text style={styles.email}>{user?.email ?? 'user@example.com'}</Text>
      </View>

      <View style={styles.statsRow}>
        <StreakBadge streak={7} />
        <LevelProgress level={3} currentXP={180} requiredXP={300} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skill Radar</Text>
        <Text style={styles.cardSubtitle}>Your proficiency across skills</Text>
        {SKILLS.map((skill) => (
          <View key={skill.name} style={styles.skillRow}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.skillBar}>
              <View style={[styles.skillBarFill, { width: `${skill.value * 100}%` }]} />
            </View>
            <Text style={styles.skillPercent}>{Math.round(skill.value * 100)}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>Notifications</Text>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>Daily Reminder</Text>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsText}>App Language</Text>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/grammar/')}
        >
          <Text style={styles.settingsText}>Grammar Genome</Text>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: -4,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillName: {
    fontSize: 13,
    color: '#374151',
    width: 80,
  },
  skillBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skillBarFill: {
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  skillPercent: {
    fontSize: 12,
    color: '#6B7280',
    width: 36,
    textAlign: 'right',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingsText: {
    fontSize: 16,
    color: '#374151',
  },
  arrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  logoutButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
