import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Task, Priority } from "@/context/TasksContext";

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; icon: "chevrons-up" | "chevron-up" | "chevron-down" }> = {
  high: { color: "#EF4444", label: "High", icon: "chevrons-up" },
  medium: { color: "#F5A623", label: "Med", icon: "chevron-up" },
  low: { color: "#6B7280", label: "Low", icon: "chevron-down" },
};

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  onDelete?: () => void;
}

export function TaskItem({ task, onToggle, onPress, onDelete }: TaskItemProps) {
  const colors = useColors();
  const priority = PRIORITY_CONFIG[task.priority];
  const completedSubs = task.subtasks.filter((s) => s.completed).length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const handleToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, task.completed && styles.completedCard]}
    >
      <Pressable onPress={handleToggle} hitSlop={10}>
        <View style={[styles.checkbox, { borderColor: task.completed ? priority.color : colors.border, backgroundColor: task.completed ? priority.color : "transparent" }]}>
          {task.completed && <Feather name="check" size={12} color="#FFFFFF" />}
        </View>
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }, task.completed && styles.completedText]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.priorityBadge, { backgroundColor: priority.color + "20" }]}>
            <Feather name={priority.icon} size={10} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
          </View>
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={11} color={isOverdue ? "#EF4444" : colors.mutedForeground} />
              <Text style={[styles.metaText, { color: isOverdue ? "#EF4444" : colors.mutedForeground }]}>
                {" "}{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
          )}
          {task.subtasks.length > 0 && (
            <View style={styles.metaItem}>
              <Feather name="list" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}> {completedSubs}/{task.subtasks.length}</Text>
            </View>
          )}
        </View>
      </View>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBtn}>
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  completedCard: { opacity: 0.6 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 4 },
  completedText: { textDecorationLine: "line-through" },
  meta: { flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" },
  priorityBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  deleteBtn: { padding: 4 },
});
