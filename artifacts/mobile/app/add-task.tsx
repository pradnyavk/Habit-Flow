import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useTasks, Priority } from "@/context/TasksContext";

const PRIORITY_OPTIONS: { label: string; value: Priority; color: string }[] = [
  { label: "High", value: "high", color: "#EF4444" },
  { label: "Medium", value: "medium", color: "#F5A623" },
  { label: "Low", value: "low", color: "#6B7280" },
];

const TAGS = ["Work", "Personal", "Health", "Finance", "Learning", "Creative"];

export default function AddTask() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addTask } = useTasks();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tag, setTag] = useState("Personal");
  const [subtaskText, setSubtaskText] = useState("");
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const addSubtask = () => {
    if (!subtaskText.trim()) return;
    setSubtasks((prev) => [...prev, { id: Date.now().toString(), title: subtaskText.trim(), completed: false }]);
    setSubtaskText("");
  };

  const removeSubtask = (id: string) => setSubtasks((prev) => prev.filter((s) => s.id !== id));

  const handleSave = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), priority, dueDate: dueDate || undefined, subtasks, tags: [tag] });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Task</Text>
        <Pressable onPress={handleSave} disabled={!title.trim()}>
          <Text style={[styles.saveBtn, { color: title.trim() ? colors.primary : colors.mutedForeground }]}>Save</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TextInput
          style={[styles.titleInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          autoFocus
          multiline
          fontSize={20}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>PRIORITY</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => setPriority(opt.value)} style={[styles.priorityBtn, { backgroundColor: priority === opt.value ? opt.color : colors.muted, borderColor: priority === opt.value ? opt.color : "transparent", borderWidth: 2 }]}>
              <Text style={[styles.priorityText, { color: priority === opt.value ? "#FFFFFF" : colors.mutedForeground }]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>TAG</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TAGS.map((t) => (
            <Pressable key={t} onPress={() => setTag(t)} style={[styles.tagBtn, { backgroundColor: t === tag ? colors.primary : colors.muted }]}>
              <Text style={[styles.tagText, { color: t === tag ? "#FFFFFF" : colors.mutedForeground }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>DUE DATE (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.dateInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
          placeholder="2025-12-31"
          placeholderTextColor={colors.mutedForeground}
          value={dueDate}
          onChangeText={setDueDate}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>SUBTASKS</Text>
        <View style={[styles.subtaskInput, { backgroundColor: colors.muted }]}>
          <TextInput
            style={[styles.subtaskTextInput, { color: colors.foreground }]}
            placeholder="Add a subtask..."
            placeholderTextColor={colors.mutedForeground}
            value={subtaskText}
            onChangeText={setSubtaskText}
            onSubmitEditing={addSubtask}
            returnKeyType="done"
          />
          <Pressable onPress={addSubtask} hitSlop={8}>
            <Feather name="plus" size={20} color={colors.primary} />
          </Pressable>
        </View>
        {subtasks.map((s) => (
          <View key={s.id} style={[styles.subtaskItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="minus" size={14} color={colors.mutedForeground} />
            <Text style={[styles.subtaskTitle, { color: colors.foreground }]} numberOfLines={1}>{s.title}</Text>
            <Pressable onPress={() => removeSubtask(s.id)} hitSlop={8}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 4 },
  titleInput: { borderRadius: 16, borderWidth: 1, padding: 16, fontFamily: "Inter_500Medium", marginBottom: 8 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 16, marginBottom: 10 },
  priorityRow: { flexDirection: "row", gap: 10 },
  priorityBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  priorityText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tagBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  tagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  dateInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontFamily: "Inter_400Regular", fontSize: 15 },
  subtaskInput: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  subtaskTextInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  subtaskItem: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, gap: 10, marginTop: 6 },
  subtaskTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
});
