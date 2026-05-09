import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface HeatmapCalendarProps {
  completions: Record<string, boolean>;
  weeks?: number;
}

function getHeatmapData(completions: Record<string, boolean>, weeks: number) {
  const data: { date: Date; level: number }[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
  const startDow = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDow);

  for (let w = 0; w < weeks + 1; w++) {
    const week: { date: Date; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().split("T")[0];
      const isFuture = date > today;
      week.push({ date, level: isFuture ? -1 : completions[key] ? 1 : 0 });
    }
    data.push(week);
  }
  return data;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function HeatmapCalendar({ completions, weeks = 16 }: HeatmapCalendarProps) {
  const colors = useColors();
  const data = getHeatmapData(completions, weeks);

  const getCellColor = (level: number) => {
    if (level === -1) return "transparent";
    if (level === 0) return colors.muted;
    return colors.primary;
  };

  return (
    <View>
      <View style={styles.labelsRow}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={[styles.dayLabel, { color: colors.mutedForeground }]}>{label}</Text>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {data.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((cell, di) => (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(cell.level), borderColor: colors.border },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Less</Text>
        {[0, 0.3, 0.6, 1].map((opacity, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: i === 0 ? colors.muted : colors.primary, opacity: i === 0 ? 1 : opacity }]} />
        ))}
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>More</Text>
      </View>
    </View>
  );
}

const CELL_SIZE = 12;
const CELL_GAP = 3;

const styles = StyleSheet.create({
  labelsRow: { flexDirection: "column", marginRight: 4, position: "absolute", left: 0, top: 0, zIndex: 1 },
  dayLabel: { fontSize: 9, fontFamily: "Inter_400Regular", height: CELL_SIZE + CELL_GAP, lineHeight: CELL_SIZE },
  grid: { flexDirection: "row", gap: CELL_GAP, paddingLeft: 28 },
  week: { flexDirection: "column", gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3, borderWidth: 0.5 },
  legend: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, alignSelf: "flex-end" },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
