export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  iconUrl: string;
  criteria: AchievementCriteria;
  xpReward: number;
}

export type AchievementCategory =
  | 'streak'
  | 'vocabulary'
  | 'grammar'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'social'
  | 'milestone';

export interface AchievementCriteria {
  type: string;
  threshold: number;
  description: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export interface DailyGoalLog {
  id: string;
  userId: string;
  date: string;
  minutesPracticed: number;
  xpEarned: number;
  lessonsCompleted: number;
  reviewsDone: number;
  goalMet: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakFreezeAvailable: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  metric: string;
  target: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  reward: number;
}
