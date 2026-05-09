import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useFocus, SessionType } from "@/context/FocusContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SESSION_CONFIG: Record<SessionType, { label: string; gradient: [string, string]; color: string }> = {
  focus: { label: "Focus", gradient: ["#5B4CF5", "#7C3AED"], color: "#5B4CF5" },
  short_break: { label: "Short Break", gradient: ["#00C896", "#00A878"], color: "#00C896" },
  long_break: { label: "Long Break", gradient: ["#F5A623", "#F56023"], color: "#F5A623" },
};

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function FocusScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRunning, isPaused, sessionType, timeRemaining, totalSeconds, completedSessions, todayFocusMinutes, settings, start, pause, reset, skip } = useFocus();

  const config = SESSION_CONFIG[sessionType];
  const minutes = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const progress = totalSeconds > 0 ? 1 - timeRemaining / totalSeconds : 0;

  const SIZE = 260;
  const STROKE = 12;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const handlePlayPause = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isRunning) start();
    else pause();
  };

  const handleReset = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skip();
  };

  const sessionDots = Array(settings.sessionsBeforeLongBreak).fill(0);

  return (
    <LinearGradient colors={["#0D0D1A", "#171730"]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Focus Timer</Text>
          <Text style={styles.headerSub}>{Math.round(todayFocusMinutes)} min focused today</Text>
        </View>
        <View style={styles.sessionDotsRow}>
          {sessionDots.map((_, i) => (
            <View key={i} style={[styles.sessionDot, { backgroundColor: i < completedSessions % settings.sessionsBeforeLongBreak || (completedSessions > 0 && completedSessions % settings.sessionsBeforeLongBreak === 0 && i < settings.sessionsBeforeLongBreak) ? config.color : "rgba(255,255,255,0.15)" }]} />
          ))}
        </View>
      </View>

      <View style={styles.sessionTypeTabs}>
        {(["focus", "short_break", "long_break"] as SessionType[]).map((type) => (
          <View key={type} style={[styles.sessionTab, { backgroundColor: type === sessionType ? "rgba(255,255,255,0.12)" : "transparent" }]}>
            <Text style={[styles.sessionTabText, { color: type === sessionType ? "#FFFFFF" : "rgba(255,255,255,0.4)" }]}>{SESSION_CONFIG[type].label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timerSection}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
          <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={radius} stroke={config.color} strokeWidth={STROKE} fill="none" strokeDasharray={circumference} animatedProps={animatedProps} strokeLinecap="round" />
        </Svg>
        <View style={[styles.timerCenter, { width: SIZE, height: SIZE }]}>
          <Text style={styles.sessionLabel}>{config.label}</Text>
          <Text style={styles.timerText}>{pad(minutes)}:{pad(secs)}</Text>
          <Text style={styles.timerSubtext}>{isRunning && !isPaused ? "In progress..." : isPaused ? "Paused" : "Ready to start"}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={handleReset} hitSlop={10} style={styles.secondaryBtn}>
          <Feather name="rotate-ccw" size={22} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <Pressable onPress={handlePlayPause} style={[styles.playBtn, { backgroundColor: config.color }]}>
          <Feather name={isRunning && !isPaused ? "pause" : "play"} size={30} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={handleSkip} hitSlop={10} style={styles.secondaryBtn}>
          <Feather name="skip-forward" size={22} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Sessions", value: `${completedSessions}`, icon: "check-circle" },
          { label: "Focus Time", value: `${Math.round(todayFocusMinutes)}m`, icon: "clock" },
          { label: "Goal", value: `${settings.focusDuration * settings.sessionsBeforeLongBreak}m`, icon: "target" },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Feather name={stat.icon as any} size={16} color={config.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: insets.bottom + 80 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  sessionDotsRow: { flexDirection: "row", gap: 6, alignItems: "center", paddingTop: 4 },
  sessionDot: { width: 10, height: 10, borderRadius: 5 },
  sessionTypeTabs: { flexDirection: "row", marginHorizontal: 24, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 16 },
  sessionTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  sessionTabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  timerSection: { alignItems: "center", justifyContent: "center", marginBottom: 32 },
  timerCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  sessionLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  timerText: { fontSize: 64, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -2 },
  timerSubtext: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 40 },
  secondaryBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  playBtn: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", paddingHorizontal: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, alignItems: "center", gap: 6 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
});
