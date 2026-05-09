import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/context/HabitsContext";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HabitDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, toggleHabitCompletion, deleteHabit, isCompletedToday, getTodayKey, getCompletionRate } = useHabits();

  const habit = habits.find((h) => h.id === id);
  if (!habit) return null;

  const todayKey = getTodayKey();
  const completed = habit.completions[todayKey] ?? false;
  const weekRate = getCompletionRate(habit, 7);
  const monthRate = getCompletionRate(habit, 30);

  const totalCompleted = Object.values(habit.completions).filter(Boolean).length;
  const joinedDate = new Date(habit.createdAt);

  const handleDelete = () => {
    Alert.alert("Delete Habit", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteHabit(habit.id); router.back(); } },
    ]);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({ key, day: DAY_NAMES[d.getDay()], date: d.getDate(), completed: !!habit.completions[key] });
    }
    return days;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[habit.color, habit.color + "BB"]} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Feather name="trash-2" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>
        <View style={styles.headerContent}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Feather name={habit.icon as any} size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.habitCategory}>{habit.category}</Text>
          <View style={styles.streakBadge}>
            <Feather name="zap" size={14} color="#FFFFFF" />
            <Text style={styles.streakText}>{habit.streak} day streak</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => toggleHabitCompletion(habit.id, todayKey)} style={[styles.toggleBtn, { backgroundColor: completed ? habit.color : colors.card, borderColor: completed ? habit.color : colors.border }]}>
          <Feather name="check" size={22} color={completed ? "#FFFFFF" : colors.mutedForeground} />
          <Text style={[styles.toggleText, { color: completed ? "#FFFFFF" : colors.foreground }]}>
            {completed ? "Completed Today!" : "Mark as Complete"}
          </Text>
        </Pressable>

        <View style={styles.statsRow}>
          {[
            { label: "7-Day Rate", value: `${Math.round(weekRate * 100)}%`, icon: "bar-chart-2" },
            { label: "30-Day Rate", value: `${Math.round(monthRate * 100)}%`, icon: "trending-up" },
            { label: "Best Streak", value: `${habit.bestStreak}d`, icon: "award" },
            { label: "Total Done", value: `${totalCompleted}`, icon: "check-circle" },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={stat.icon as any} size={16} color={habit.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LAST 7 DAYS</Text>
        <View style={[styles.weekRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {getLast7Days().map((d) => (
            <View key={d.key} style={styles.weekDay}>
              <Text style={[styles.weekDayName, { color: colors.mutedForeground }]}>{d.day}</Text>
              <View style={[styles.weekDot, { backgroundColor: d.completed ? habit.color : colors.muted }]}>
                {d.completed && <Feather name="check" size={10} color="#FFFFFF" />}
              </View>
              <Text style={[styles.weekDate, { color: colors.mutedForeground }]}>{d.date}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>HISTORY</Text>
        <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <HeatmapCalendar completions={habit.completions} weeks={12} />
        </View>

        {habit.notes ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>NOTES</Text>
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesText, { color: colors.foreground }]}>{habit.notes}</Text>
            </View>
          </>
        ) : null}

        <Text style={[styles.joinedText, { color: colors.mutedForeground }]}>
          Started {MONTH_NAMES[joinedDate.getMonth()]} {joinedDate.getDate()}, {joinedDate.getFullYear()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 28, paddingHorizontal: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  headerContent: { alignItems: "center", gap: 8 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  habitTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", textAlign: "center" },
  habitCategory: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  streakBadge: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  content: { padding: 20, gap: 12 },
  toggleBtn: { flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1.5, paddingVertical: 18 },
  toggleText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: "45%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 8 },
  weekRow: { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 16 },
  weekDay: { flex: 1, alignItems: "center", gap: 6 },
  weekDayName: { fontSize: 11, fontFamily: "Inter_500Medium" },
  weekDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  weekDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  heatmapCard: { borderRadius: 16, borderWidth: 1, padding: 16, overflow: "hidden" },
  notesCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  joinedText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
});
