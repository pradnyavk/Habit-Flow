import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  gradient?: [string, string];
  small?: boolean;
}

export function StatsCard({ title, value, subtitle, icon, gradient, small = false }: StatsCardProps) {
  const colors = useColors();

  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={[styles.card, small && styles.smallCard]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name={icon as any} size={small ? 16 : 20} color="#FFFFFF" />
        </View>
        <Text style={[styles.value, { color: "#FFFFFF" }, small && styles.smallValue]}>{value}</Text>
        <Text style={[styles.title, { color: "rgba(255,255,255,0.8)" }, small && styles.smallTitle]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.65)" }]}>{subtitle}</Text> : null}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, small && styles.smallCard]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon as any} size={small ? 16 : 20} color={colors.primary} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }, small && styles.smallValue]}>{value}</Text>
      <Text style={[styles.title, { color: colors.mutedForeground }, small && styles.smallTitle]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    gap: 6,
    flex: 1,
  },
  smallCard: { padding: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  value: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  smallValue: { fontSize: 20 },
  title: { fontSize: 12, fontFamily: "Inter_500Medium" },
  smallTitle: { fontSize: 11 },
  subtitle: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
