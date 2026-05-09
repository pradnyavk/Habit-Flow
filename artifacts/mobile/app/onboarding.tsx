import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  { id: "1", title: "Build Better\nHabits", subtitle: "Track daily habits, build streaks, and become the best version of yourself.", icon: "check-circle", gradient: ["#5B4CF5", "#7C3AED"] as [string, string] },
  { id: "2", title: "Focus &\nAchieve More", subtitle: "Use our Pomodoro timer to maximize productivity and crush your daily goals.", icon: "clock", gradient: ["#F5A623", "#F56023"] as [string, string] },
  { id: "3", title: "Track Your\nProgress", subtitle: "Beautiful analytics and streaks keep you motivated and moving forward.", icon: "trending-up", gradient: ["#00C896", "#00A878"] as [string, string] },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: step + 1 });
      setStep(step + 1);
    } else {
      setStep(SLIDES.length);
    }
  };

  const handleStart = () => {
    const finalName = name.trim() || "Champion";
    completeOnboarding(finalName);
    router.replace("/(tabs)");
  };

  if (step === SLIDES.length) {
    return (
      <LinearGradient colors={["#5B4CF5", "#7C3AED"]} style={[styles.nameScreen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.nameCenterContent}>
          <View style={styles.nameIconWrap}>
            <Feather name="user" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.nameTitle}>What's your name?</Text>
          <Text style={styles.nameSubtitle}>We'll personalize your experience</Text>
          <TextInput
            style={[styles.nameInput, { backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }]}
            placeholder="Your name..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </View>
        <Pressable onPress={handleStart} style={styles.startBtn}>
          <Text style={[styles.startBtnText, { color: "#5B4CF5" }]}>Let's Start</Text>
          <Feather name="arrow-right" size={20} color="#5B4CF5" />
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + 40 }]}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={[styles.slide, { width }]}>
            <View style={styles.slideIconWrap}>
              <Feather name={item.icon as any} size={80} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? colors.primary : colors.muted, width: i === step ? 20 : 8 }]} />
          ))}
        </View>
        <Pressable onPress={goNext} style={[styles.nextBtn, { backgroundColor: colors.primary }]}>
          <Feather name="arrow-right" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingHorizontal: 40 },
  slideIconWrap: { width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  slideTitle: { fontSize: 40, fontFamily: "Inter_700Bold", color: "#FFFFFF", textAlign: "center", letterSpacing: -1, lineHeight: 48 },
  slideSubtitle: { fontSize: 16, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 24 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 32, paddingTop: 24 },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  nameScreen: { flex: 1, paddingHorizontal: 32 },
  nameCenterContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  nameIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  nameTitle: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF", textAlign: "center" },
  nameSubtitle: { fontSize: 16, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", textAlign: "center" },
  nameInput: { width: "100%", borderRadius: 16, padding: 18, fontSize: 18, fontFamily: "Inter_500Medium", marginTop: 16 },
  startBtn: { flexDirection: "row", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  startBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
