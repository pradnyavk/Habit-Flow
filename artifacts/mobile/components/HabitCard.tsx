import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Habit } from "@/context/HabitsContext";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onPress?: () => void;
  compact?: boolean;
}

export function HabitCard({ habit, isCompleted, onToggle, onPress, compact = false }: HabitCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, { damping: 12, stiffness: 200 });
  }, [isCompleted]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleToggle = () => {
    scale.value = withSequence(withTiming(0.95, { duration: 80 }), withSpring(1, { damping: 12 }));
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  return (
    <Animated.View style={[cardStyle, styles.wrapper]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          isCompleted && { borderColor: habit.color + "40", backgroundColor: habit.color + "10" },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: habit.color + "20" }]}>
          <Feather name={habit.icon as any} size={compact ? 16 : 20} color={habit.color} />
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: colors.foreground },
              isCompleted && { textDecorationLine: "line-through", color: colors.mutedForeground },
            ]}
            numberOfLines={1}
          >
            {habit.title}
          </Text>
          <View style={styles.meta}>
            <Feather name="zap" size={11} color={colors.accent} />
            <Text style={[styles.streak, { color: colors.mutedForeground }]}> {habit.streak} day streak</Text>
            {!compact && (
              <>
                <Text style={[styles.dot, { color: colors.mutedForeground }]}> · </Text>
                <Text style={[styles.streak, { color: colors.mutedForeground }]}>{habit.category}</Text>
              </>
            )}
          </View>
        </View>
        <Pressable onPress={handleToggle} hitSlop={10} style={[styles.check, { borderColor: isCompleted ? habit.color : colors.border, backgroundColor: isCompleted ? habit.color : "transparent" }]}>
          <Animated.View style={checkStyle}>
            <Feather name="check" size={14} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  meta: { flexDirection: "row", alignItems: "center" },
  streak: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dot: { fontSize: 12 },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
