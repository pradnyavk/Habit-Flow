import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/context/HabitsContext";
import { useTasks } from "@/context/TasksContext";
import { useFocus } from "@/context/FocusContext";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const colors = useColors();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => {
        const barHeight = useSharedValue(0);
        useEffect(() => {
          barHeight.value = withDelay(i * 60, withTiming((item.value / max) * 120, { duration: 600, easing: Easing.out(Easing.cubic) }));
        }, [item.value]);
        const barStyle = useAnimatedStyle(() => ({ height: barHeight.value }));
        return (
          <View key={item.label} style={chartStyles.barGroup}>
            <Text style={[chartStyles.barValue, { color: colors.mutedForeground }]}>{Math.round(item.value * 100)}%</Text>
            <View style={[chartStyles.barTrack, { backgroundColor: colors.muted }]}>
              <Animated.View style={[chartStyles.bar, { backgroundColor: color }, barStyle]} />
            </View>
            <Text style={[chartStyles.barLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 150, paddingBottom: 28 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: { width: 24, height: 120, borderRadius: 8, justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", borderRadius: 8 },
  barValue: { fontSize: 9, fontFamily: "Inter_400Regular" },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 4 },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { habits, getCompletionRate, getTodayCompletionRate } = useHabits();
  const { tasks } = useTasks();
  const { sessions, todayFocusMinutes } = useFocus();

  const weekData = DAY_NAMES.map((day, i) => {
    const d = new Date();
    const currentDay = d.getDay();
    const diff = i - currentDay;
    d.setDate(d.getDate() + diff);
    const key = d.toISOString().split("T")[0];
    const total = habits.length || 1;
    const completed = habits.filter((h) => h.completions[key]).length;
    return { label: day.slice(0, 1), value: completed / total };
  });

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  const totalHabits = habits.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const todayRate = getTodayCompletionRate();
  const totalFocusSessions = sessions.filter((s) => s.type === "focus").length;

  const allCompletions: Record<string, boolean> = {};
  habits.forEach((h) => {
    Object.entries(h.completions).forEach(([date, done]) => {
      if (done) allCompletions[date] = true;
    });
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analytics</Text>
      <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Your productivity overview</Text>

      <View style={styles.statsGrid}>
        {[
          { label: "Today's Rate", value: `${Math.round(todayRate * 100)}%`, icon: "trending-up", color: colors.primary },
          { label: "Best Streak", value: `${bestStreak}d`, icon: "zap", color: colors.accent },
          { label: "Focus Today", value: `${Math.round(todayFocusMinutes)}m`, icon: "clock", color: "#00C896" },
          { label: "Tasks Done", value: `${completedTasks}`, icon: "check-circle", color: "#FF6B9D" },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
              <Feather name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Completion</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Habit completion rate per day</Text>
        <BarChart data={weekData} color={colors.primary} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Habit Overview</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Individual habit stats</Text>
        {habits.map((h) => {
          const rate = getCompletionRate(h, 30);
          return (
            <View key={h.id} style={styles.habitRow}>
              <View style={[styles.habitDot, { backgroundColor: h.color }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.habitRowHeader}>
                  <Text style={[styles.habitName, { color: colors.foreground }]}>{h.title}</Text>
                  <Text style={[styles.habitRate, { color: colors.mutedForeground }]}>{Math.round(rate * 100)}%</Text>
                </View>
                <View style={[styles.habitBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.habitFill, { width: `${rate * 100}%` as any, backgroundColor: h.color }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity Heatmap</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Days you completed any habit</Text>
        <HeatmapCalendar completions={allCompletions} weeks={14} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Focus Summary</Text>
        <View style={styles.focusStats}>
          {[
            { label: "Total Sessions", value: totalFocusSessions },
            { label: "Today", value: `${Math.round(todayFocusMinutes)}m` },
            { label: "This Week", value: `${Math.round(sessions.filter((s) => { const d = new Date(); const w = new Date(d.getTime() - 7 * 86400000); return new Date(s.completedAt) > w && s.type === "focus"; }).reduce((acc, s) => acc + s.duration / 60, 0))}m` },
          ].map((stat) => (
            <View key={stat.label} style={[styles.focusStat, { backgroundColor: colors.muted }]}>
              <Text style={[styles.focusStatValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.focusStatLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 14 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 2 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 4 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 16 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  habitDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  habitRowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  habitName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  habitRate: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  habitBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  habitFill: { height: "100%", borderRadius: 3 },
  focusStats: { flexDirection: "row", gap: 10, marginTop: 8 },
  focusStat: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", gap: 4 },
  focusStatValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  focusStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
