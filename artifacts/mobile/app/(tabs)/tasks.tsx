import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useTasks, Priority } from "@/context/TasksContext";
import { TaskItem } from "@/components/TaskItem";

const FILTERS = ["All", "Pending", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, toggleTask, deleteTask, pendingCount } = useTasks();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = tasks.filter((t) => {
    if (filter === "Pending") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const sections = [
    { title: "High Priority", data: filtered.filter((t) => t.priority === "high" && !t.completed) },
    { title: "Medium Priority", data: filtered.filter((t) => t.priority === "medium" && !t.completed) },
    { title: "Low Priority", data: filtered.filter((t) => t.priority === "low" && !t.completed) },
    { title: "Completed", data: filtered.filter((t) => t.completed) },
  ].filter((s) => s.data.length > 0);

  const displayData = filter !== "All" ? [{ title: "", data: filtered }] : sections;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tasks</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{pendingCount} pending</Text>
        </View>
        <Pressable onPress={() => router.push("/add-task")} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, { backgroundColor: f === filter ? colors.primary : colors.muted }]}>
            <Text style={[styles.filterText, { color: f === filter ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <SectionList
        sections={displayData}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={() => toggleTask(item.id)} onDelete={() => deleteTask(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="check-square" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear!</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tasks here. Add one with the + button.</Text>
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
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
