import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  onboardingComplete: boolean;
  joinDate: string;
  achievements: Achievement[];
  dailyChallengeStreak: number;
}

interface UserContextType {
  user: UserProfile;
  updateName: (name: string) => void;
  addXP: (amount: number) => void;
  completeOnboarding: (name: string) => void;
  unlockAchievement: (id: string) => void;
  isOnboardingDone: boolean;
}

const UserContext = createContext<UserContextType | null>(null);
const STORAGE_KEY = "@habitflow_user";

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_habit", title: "First Step", description: "Complete your first habit", icon: "star", xpReward: 50 },
  { id: "week_streak", title: "Week Warrior", description: "7-day streak on any habit", icon: "zap", xpReward: 100 },
  { id: "perfect_day", title: "Perfect Day", description: "Complete all habits in a day", icon: "award", xpReward: 150 },
  { id: "focus_master", title: "Focus Master", description: "Complete 10 Pomodoro sessions", icon: "clock", xpReward: 200 },
  { id: "task_crusher", title: "Task Crusher", description: "Complete 20 tasks", icon: "check-circle", xpReward: 100 },
  { id: "month_streak", title: "Consistency King", description: "30-day streak on any habit", icon: "crown", xpReward: 500 },
];

const DEFAULT_USER: UserProfile = {
  name: "Champion",
  xp: 0,
  level: 1,
  onboardingComplete: false,
  joinDate: new Date().toISOString(),
  achievements: ACHIEVEMENTS,
  dailyChallengeStreak: 0,
};

const XP_PER_LEVEL = 500;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data) as UserProfile;
          setUser({ ...DEFAULT_USER, ...parsed, achievements: parsed.achievements?.length ? parsed.achievements : ACHIEVEMENTS });
        } catch {
          // corrupted storage data — keep defaults
        }
      }
    }).catch(() => {
      // storage read failed — keep defaults
    });
  }, []);

  const save = (updated: UserProfile) => {
    setUser(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {
      // storage write failed — in-memory state still updated
    });
  };

  const updateName = (name: string) => save({ ...user, name });

  const addXP = (amount: number) => {
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    save({ ...user, xp: newXP, level: newLevel });
  };

  const completeOnboarding = (name: string) => {
    save({ ...user, name, onboardingComplete: true });
  };

  const unlockAchievement = (id: string) => {
    const already = user.achievements.find((a) => a.id === id && a.unlockedAt);
    if (already) return;
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    const updatedAchievements = user.achievements.map((a) =>
      a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
    );
    const newXP = user.xp + (achievement?.xpReward ?? 0);
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    save({ ...user, achievements: updatedAchievements, xp: newXP, level: newLevel });
  };

  return (
    <UserContext.Provider value={{ user, updateName, addXP, completeOnboarding, unlockAchievement, isOnboardingDone: user.onboardingComplete }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
