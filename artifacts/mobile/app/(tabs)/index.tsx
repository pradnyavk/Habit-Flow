import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/context/HabitsContext";
import { useTasks } from "@/context/TasksContext";
import { useFocus } from "@/context/FocusContext";
import { useUser } from "@/context/UserContext";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { CalendarStrip } from "@/components/CalendarStrip";
import { getDailyQuote } from "@/constants/quotes";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, toggleHabitCompletion, isCompletedToday, getTodayKey, getTodayCompletionRate } = useHabits();
  const { pendingCount } = useTasks();
  const { todayFocusMinutes } = useFocus();
  const { user, addXP, unlockAchievement } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayKey = getTodayKey();
  const completionRate = getTodayCompletionRate();
  const completedCount = habits.filter((h) => isCompletedToday(h)).length;
  const quote = getDailyQuote();
  const greeting = getGreeting();

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const topInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding = Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 90;

  const handleToggle = (habitId: string) => {
    const result = toggleHabitCompletion(habitId, todayKey);
    if (result.nowCompleted) {
      addXP(10);
      if (result.isFirstEver) unlockAchievement("first_habit");
      if (result.allDoneToday) unlockAchievement("perfect_day");
      if (result.anyWeekStreak) unlockAchievement("week_streak");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.headerGradient, { paddingTop: topInset + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <Pressable onPress={() => router.push("/settings")} style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <ProgressRing
            progress={completionRate}
            size={130}
            strokeWidth={12}
            color="#FFFFFF"
            bgColor="rgba(255,255,255,0.2)"
            gradientColors={undefined}
            showLabel
            label="Today"
          />
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completedCount}/{habits.length}</Text>
              <Text style={styles.progressStatLabel}>Habits done</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{pendingCount}</Text>
              <Text style={styles.progressStatLabel}>Tasks left</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{Math.round(todayFocusMinutes)}m</Text>
              <Text style={styles.progressStatLabel}>Focused</Text>
            </View>
          </View>
        </View>

        <View style={[styles.levelBadge]}>
          <Feather name="zap" size={12} color={colors.accent} />
          <Text style={styles.levelText}>Level {user.level} · {user.xp} XP</Text>
        </View>
      </LinearGradient>

      <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Habits</Text>
          <Pressable onPress={() => router.push("/add-habit")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>+ Add</Text>
          </Pressable>
        </View>
        {habits.slice(0, 4).map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            isCompleted={isCompletedToday(habit)}
            onToggle={() => handleToggle(habit.id)}
            onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
          />
        ))}
        {habits.length === 0 && (
          <Pressable onPress={() => router.push("/add-habit")} style={[styles.emptyHabits, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="plus-circle" size={24} color={colors.primary} />
            <Text style={[styles.emptyHabitsText, { color: colors.mutedForeground }]}>Add your first habit</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.quickActions}>
        <Pressable onPress={() => router.push("/add-habit")} style={[styles.quickAction, { backgroundColor: colors.primary }]}>
          <Feather name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>New Habit</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/add-task")} style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Feather name="list" size={20} color={colors.primary} />
          <Text style={[styles.quickActionText, { color: colors.foreground }]}>New Task</Text>
        </Pressable>
      </View>

      <LinearGradient colors={["#1E1E3A", "#252545"]} style={styles.quoteCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Feather name="book-open" size={18} color="rgba(255,255,255,0.5)" />
        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 28 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  userName: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  dateText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  progressSection: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 16 },
  progressStats: { flex: 1, flexDirection: "row", alignItems: "center" },
  progressStat: { flex: 1, alignItems: "center" },
  progressStatValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  progressStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  progressDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  levelBadge: { flexDirection: "row", gap: 6, alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  section: { padding: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyHabits: { borderRadius: 16, borderWidth: 1, borderStyle: "dashed", padding: 24, alignItems: "center", gap: 10 },
  emptyHabitsText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  quickActions: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  quickAction: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14 },
  quickActionText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  quoteCard: { marginHorizontal: 20, borderRadius: 18, padding: 20, gap: 10, marginBottom: 16 },
  quoteText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 22, fontStyle: "italic" },
  quoteAuthor: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.55)", alignSelf: "flex-end" },
});
