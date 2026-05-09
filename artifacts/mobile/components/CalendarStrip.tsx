import React, { useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function getDays(center: Date, count = 14): Date[] {
  const days: Date[] = [];
  const start = new Date(center);
  start.setDate(start.getDate() - 6);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarStrip({ selectedDate, onSelectDate }: CalendarStripProps) {
  const colors = useColors();
  const days = getDays(selectedDate);
  const today = new Date();
  const flatRef = useRef<FlatList>(null);

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();

  return (
    <View>
      <FlatList
        ref={flatRef}
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(d) => d.toISOString()}
        initialScrollIndex={5}
        getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
        contentContainerStyle={styles.list}
        renderItem={({ item: day }) => {
          const selected = isSelected(day);
          const todayDay = isToday(day);
          return (
            <Pressable onPress={() => onSelectDate(day)} style={styles.dayWrapper}>
              <View style={[
                styles.day,
                { backgroundColor: colors.muted },
                selected && { backgroundColor: colors.primary },
                todayDay && !selected && { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.muted },
              ]}>
                <Text style={[styles.dayName, { color: selected ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                  {DAY_NAMES[day.getDay()]}
                </Text>
                <Text style={[styles.dayNum, { color: selected ? "#FFFFFF" : todayDay ? colors.primary : colors.foreground }]}>
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 8 },
  dayWrapper: { alignItems: "center" },
  day: { width: 48, height: 64, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 4 },
  dayName: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dayNum: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
