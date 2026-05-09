import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientCardProps {
  children: React.ReactNode;
  colors: [string, string];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  padding?: number;
  borderRadius?: number;
}

export function GradientCard({ children, colors, style, start = { x: 0, y: 0 }, end = { x: 1, y: 1 }, padding = 20, borderRadius = 20 }: GradientCardProps) {
  return (
    <LinearGradient colors={colors} style={[styles.card, { padding, borderRadius }, style]} start={start} end={end}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
