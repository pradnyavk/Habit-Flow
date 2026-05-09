import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { useFocus } from "@/context/FocusContext";
import { useHabits } from "@/context/HabitsContext";
import { LinearGradient } from "expo-linear-gradient";

const XP_PER_LEVEL = 500;

export default function Settings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateName } = useUser();
  const { settings, updateSettings } = useFocus();
  const { habits } = useHabits();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user.name);

  const xpProgress = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - (user.xp % XP_PER_LEVEL);
  const unlockedCount = user.achievements.filter((a) => a.unlockedAt).length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  const saveName = () => {
    updateName(name.trim() || user.name);
    setEditingName(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile & Settings</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.profileCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          {editingName ? (
            <View style={styles.nameEdit}>
              <TextInput style={styles.nameInput} value={name} onChangeText={setName} autoFocus onSubmitEditing={saveName} returnKeyType="done" />
              <Pressable onPress={saveName}><Feather name="check" size={18} color="#FFFFFF" /></Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={styles.nameRow}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Feather name="edit-2" size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
          <Text style={styles.profileLevel}>Level {user.level}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
          <Text style={styles.xpText}>{user.xp} XP · {xpToNext} to Level {user.level + 1}</Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { label: "Habits", value: String(habits.length), icon: "check-circle" },
            { label: "Achievements", value: `${unlockedCount}/${user.achievements.length}`, icon: "award" },
            { label: "Best Streak", value: String(maxStreak), icon: "zap" },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={stat.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACHIEVEMENTS</Text>
        {user.achievements.map((a) => (
          <View key={a.id} style={[styles.achievementRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: a.unlockedAt ? 1 : 0.5 }]}>
            <View style={[styles.achIcon, { backgroundColor: a.unlockedAt ? colors.primary + "20" : colors.muted }]}>
              <Feather name={a.icon as any} size={18} color={a.unlockedAt ? colors.primary : colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.achTitle, { color: colors.foreground }]}>{a.title}</Text>
              <Text style={[styles.achDesc, { color: colors.mutedForeground }]}>{a.description}</Text>
            </View>
            <Text style={[styles.achXP, { color: colors.accent }]}>+{a.xpReward} XP</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>FOCUS SETTINGS</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Focus Duration", value: settings.focusDuration, key: "focusDuration", unit: "min" },
            { label: "Short Break", value: settings.shortBreakDuration, key: "shortBreakDuration", unit: "min" },
            { label: "Long Break", value: settings.longBreakDuration, key: "longBreakDuration", unit: "min" },
            { label: "Sessions before long break", value: settings.sessionsBeforeLongBreak, key: "sessionsBeforeLongBreak", unit: "" },
          ].map((item) => (
            <View key={item.key} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              <View style={styles.settingControl}>
                <Pressable onPress={() => updateSettings({ [item.key]: Math.max(1, item.value - 1) })} style={[styles.controlBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="minus" size={14} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.settingValue, { color: colors.foreground }]}>{item.value}{item.unit}</Text>
                <Pressable onPress={() => updateSettings({ [item.key]: item.value + 1 })} style={[styles.controlBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="plus" size={14} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 12 },
  profileCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  nameRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  profileLevel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  nameEdit: { flexDirection: "row", gap: 10, alignItems: "center" },
  nameInput: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.5)", paddingBottom: 4 },
  xpBar: { width: "100%", height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3 },
  xpText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 12 },
  achievementRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  achIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  achTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  achDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  achXP: { fontSize: 12, fontFamily: "Inter_700Bold" },
  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  settingControl: { flexDirection: "row", alignItems: "center", gap: 12 },
  controlBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  settingValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", minWidth: 44, textAlign: "center" },
});
