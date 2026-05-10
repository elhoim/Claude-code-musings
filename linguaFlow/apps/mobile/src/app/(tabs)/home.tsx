import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { StreakBadge } from '../../components/StreakBadge';
import { LevelProgress } from '../../components/LevelProgress';

const QUICK_ACTIONS = [
  { title: 'Continue Story', subtitle: 'Chapter 3: The Market', route: '/story/1' },
  { title: 'Review Cards', subtitle: '12 cards due', route: '/(tabs)/review' },
  { title: 'Start Drill', subtitle: 'Pressure Cooker', route: '/(tabs)/practice' },
];

const WEEKLY_STATS = [
  { day: 'M', minutes: 15, goal: 15 },
  { day: 'T', minutes: 10, goal: 15 },
  { day: 'W', minutes: 20, goal: 15 },
  { day: 'T', minutes: 15, goal: 15 },
  { day: 'F', minutes: 5, goal: 15 },
  { day: 'S', minutes: 0, goal: 15 },
  { day: 'S', minutes: 0, goal: 15 },
];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName ?? 'Learner';

  const dailyMinutes = 10;
  const dailyGoal = 15;
  const dailyProgress = Math.min(dailyMinutes / dailyGoal, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, {displayName}!</Text>

      <View style={styles.statsRow}>
        <StreakBadge streak={7} />
        <LevelProgress level={3} currentXP={180} requiredXP={300} />
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Daily Goal</Text>
        <View style={styles.goalBar}>
          <View style={[styles.goalBarFill, { width: `${dailyProgress * 100}%` }]} />
        </View>
        <Text style={styles.goalText}>
          {dailyMinutes} / {dailyGoal} minutes
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.title}
          style={styles.actionCard}
          onPress={() => router.push(action.route as any)}
        >
          <View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </View>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.weekRow}>
        {WEEKLY_STATS.map((stat, i) => {
          const height = stat.goal > 0 ? Math.max((stat.minutes / stat.goal) * 40, 4) : 4;
          const met = stat.minutes >= stat.goal;
          return (
            <View key={i} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayBar,
                  { height },
                  met ? styles.dayBarMet : styles.dayBarUnmet,
                ]}
              />
              <Text style={styles.dayLabel}>{stat.day}</Text>
            </View>
          );
        })}
      </View>
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
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  goalBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
  },
  goalBarFill: {
    height: 10,
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  goalText: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    height: 100,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  dayBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 6,
  },
  dayBarMet: {
    backgroundColor: '#10B981',
  },
  dayBarUnmet: {
    backgroundColor: '#D1D5DB',
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
