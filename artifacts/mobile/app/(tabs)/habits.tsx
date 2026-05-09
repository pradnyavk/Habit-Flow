import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/context/HabitsContext";
import { HabitCard } from "@/components/HabitCard";

const CATEGORIES = ["All", "Health", "Mindfulness", "Learning", "Productivity", "Fitness"];

export default function HabitsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, toggleHabitCompletion, isCompletedToday, getTodayKey, getTodayCompletionRate } = useHabits();
  const [filter, setFilter] = useState("All");

  const todayKey = getTodayKey();
  const filtered = filter === "All" ? habits : habits.filter((h) => h.category === filter);
  const completionRate = getTodayCompletionRate();
  const completedCount = habits.filter((h) => isCompletedToday(h)).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Habits</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{completedCount}/{habits.length} done today</Text>
        </View>
        <Pressable onPress={() => router.push("/add-habit")} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { width: `${completionRate * 100}%` as any, backgroundColor: colors.primary }]} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(h) => h.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => c}
            contentContainerStyle={styles.categories}
            renderItem={({ item: cat }) => (
              <Pressable onPress={() => setFilter(cat)} style={[styles.catBtn, { backgroundColor: cat === filter ? colors.primary : colors.muted }]}>
                <Text style={[styles.catText, { color: cat === filter ? "#FFFFFF" : colors.mutedForeground }]}>{cat}</Text>
              </Pressable>
            )}
          />
        }
        renderItem={({ item: habit }) => (
          <HabitCard
            habit={habit}
            isCompleted={isCompletedToday(habit)}
            onToggle={() => toggleHabitCompletion(habit.id, todayKey)}
            onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="check-circle" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No habits yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tap the + button to create your first habit</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  progressBar: { height: 3, marginHorizontal: 20, borderRadius: 2, marginTop: 4 },
  progressFill: { height: "100%", borderRadius: 2 },
  list: { padding: 16, gap: 2 },
  categories: { gap: 8, paddingBottom: 12 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
