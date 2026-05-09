import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekly" | "custom";
  targetDays: number[];
  streak: number;
  bestStreak: number;
  completions: Record<string, boolean>;
  category: string;
  notes: string;
  createdAt: string;
}

interface HabitsContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "streak" | "bestStreak" | "completions" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  isCompletedToday: (habit: Habit) => boolean;
  getTodayKey: () => string;
  getCompletionRate: (habit: Habit, days?: number) => number;
  getTodayCompletionRate: () => number;
}

const HabitsContext = createContext<HabitsContextType | null>(null);
const STORAGE_KEY = "@habitflow_habits";

const SAMPLE_HABITS: Habit[] = [
  { id: "1", title: "Morning Meditation", icon: "sun", color: "#5B4CF5", frequency: "daily", targetDays: [0,1,2,3,4,5,6], streak: 7, bestStreak: 14, completions: {}, category: "Mindfulness", notes: "10 minutes of mindful breathing", createdAt: new Date().toISOString() },
  { id: "2", title: "Exercise", icon: "activity", color: "#F5A623", frequency: "daily", targetDays: [0,1,2,3,4,5,6], streak: 3, bestStreak: 21, completions: {}, category: "Health", notes: "At least 30 minutes", createdAt: new Date().toISOString() },
  { id: "3", title: "Read", icon: "book-open", color: "#00C896", frequency: "daily", targetDays: [0,1,2,3,4,5,6], streak: 12, bestStreak: 30, completions: {}, category: "Learning", notes: "30 pages minimum", createdAt: new Date().toISOString() },
  { id: "4", title: "Drink Water", icon: "droplet", color: "#06B6D4", frequency: "daily", targetDays: [0,1,2,3,4,5,6], streak: 5, bestStreak: 10, completions: {}, category: "Health", notes: "8 glasses per day", createdAt: new Date().toISOString() },
  { id: "5", title: "Journaling", icon: "edit-3", color: "#FF6B9D", frequency: "daily", targetDays: [0,1,2,3,4,5,6], streak: 2, bestStreak: 7, completions: {}, category: "Mindfulness", notes: "Gratitude + goals", createdAt: new Date().toISOString() },
];

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(SAMPLE_HABITS);

  const getTodayKey = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data) as Habit[];
        if (parsed.length > 0) setHabits(parsed);
      }
    });
  }, []);

  const save = (updated: Habit[]) => {
    setHabits(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addHabit = (habit: Omit<Habit, "id" | "streak" | "bestStreak" | "completions" | "createdAt">) => {
    const newHabit: Habit = { ...habit, id: Date.now().toString() + Math.random().toString(36).substr(2, 6), streak: 0, bestStreak: 0, completions: {}, createdAt: new Date().toISOString() };
    save([...habits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    save(habits.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    save(habits.filter((h) => h.id !== id));
  };

  const toggleHabitCompletion = (id: string, date: string) => {
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const completions = { ...h.completions };
      const wasCompleted = completions[date];
      completions[date] = !wasCompleted;
      const newStreak = calculateStreak(completions);
      const bestStreak = Math.max(h.bestStreak, newStreak);
      return { ...h, completions, streak: newStreak, bestStreak };
    });
    save(updated);
  };

  const calculateStreak = (completions: Record<string, boolean>): number => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (completions[key]) streak++;
      else break;
    }
    return streak;
  };

  const isCompletedToday = (habit: Habit) => {
    return !!habit.completions[getTodayKey()];
  };

  const getCompletionRate = (habit: Habit, days = 7): number => {
    let completed = 0;
    let total = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      if (habit.targetDays.includes(dayOfWeek) || habit.frequency === "daily") {
        total++;
        const key = d.toISOString().split("T")[0];
        if (habit.completions[key]) completed++;
      }
    }
    return total === 0 ? 0 : completed / total;
  };

  const getTodayCompletionRate = (): number => {
    const todayKey = getTodayKey();
    const todayDay = new Date().getDay();
    const todayHabits = habits.filter((h) => h.frequency === "daily" || h.targetDays.includes(todayDay));
    if (todayHabits.length === 0) return 0;
    const completed = todayHabits.filter((h) => h.completions[todayKey]).length;
    return completed / todayHabits.length;
  };

  return (
    <HabitsContext.Provider value={{ habits, addHabit, updateHabit, deleteHabit, toggleHabitCompletion, isCompletedToday, getTodayKey, getCompletionRate, getTodayCompletionRate }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
