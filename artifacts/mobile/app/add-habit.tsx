import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/context/HabitsContext";

const ICONS = ["sun", "activity", "book-open", "droplet", "edit-3", "heart", "music", "coffee", "bike", "moon", "smile", "star", "zap", "target", "wind"];
const COLORS = ["#5B4CF5", "#F5A623", "#00C896", "#EF4444", "#FF6B9D", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#3B82F6"];
const CATEGORIES = ["Health", "Mindfulness", "Learning", "Productivity", "Fitness", "Social", "Finance", "Creative"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function AddHabit() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addHabit } = useHabits();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("sun");
  const [color, setColor] = useState("#5B4CF5");
  const [category, setCategory] = useState("Health");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [notes, setNotes] = useState("");

  const toggleDay = (d: number) => {
    setTargetDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addHabit({ title: title.trim(), icon, color, frequency, targetDays, category, notes });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Habit</Text>
        <Pressable onPress={handleSave} disabled={!title.trim()}>
          <Text style={[styles.saveBtn, { color: title.trim() ? colors.primary : colors.mutedForeground }]}>Save</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconPreview, { backgroundColor: color + "20" }]}>
            <Feather name={icon as any} size={32} color={color} />
          </View>
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            placeholder="Habit name..."
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            autoFocus
            fontSize={22}
          />
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>ICON</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {ICONS.map((ic) => (
            <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconBtn, { backgroundColor: ic === icon ? color + "20" : colors.muted, borderColor: ic === icon ? color : "transparent", borderWidth: 2 }]}>
              <Feather name={ic as any} size={20} color={ic === icon ? color : colors.mutedForeground} />
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>COLOR</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorSelected]} />
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.categoryBtn, { backgroundColor: cat === category ? colors.primary : colors.muted }]}>
              <Text style={[styles.categoryText, { color: cat === category ? "#FFFFFF" : colors.mutedForeground }]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>FREQUENCY</Text>
        <View style={styles.freqRow}>
          {(["daily", "weekly", "custom"] as const).map((f) => (
            <Pressable key={f} onPress={() => setFrequency(f)} style={[styles.freqBtn, { backgroundColor: frequency === f ? colors.primary : colors.muted, flex: 1 }]}>
              <Text style={[styles.freqText, { color: frequency === f ? "#FFFFFF" : colors.mutedForeground }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </Pressable>
          ))}
        </View>

        {frequency === "custom" && (
          <>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>DAYS</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <Pressable key={i} onPress={() => toggleDay(i)} style={[styles.dayBtn, { backgroundColor: targetDays.includes(i) ? color : colors.muted }]}>
                  <Text style={[styles.dayText, { color: targetDays.includes(i) ? "#FFFFFF" : colors.mutedForeground }]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.label, { color: colors.mutedForeground }]}>NOTES</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="Add notes or motivation..."
          placeholderTextColor={colors.mutedForeground}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", gap: 12, marginBottom: 12 },
  iconPreview: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  titleInput: { width: "100%", textAlign: "center", fontFamily: "Inter_600SemiBold", borderBottomWidth: 1, paddingBottom: 8 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  row: { marginBottom: 4 },
  iconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 8 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  categoryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  freqRow: { flexDirection: "row", gap: 8 },
  freqBtn: { paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  freqText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  daysRow: { flexDirection: "row", gap: 8 },
  dayBtn: { flex: 1, aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  notesInput: { borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", textAlignVertical: "top", minHeight: 80 },
});
