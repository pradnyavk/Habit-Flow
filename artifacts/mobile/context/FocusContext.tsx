import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type SessionType = "focus" | "short_break" | "long_break";

export interface FocusSession {
  id: string;
  type: SessionType;
  duration: number;
  completedAt: string;
}

interface FocusSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface FocusContextType {
  isRunning: boolean;
  isPaused: boolean;
  sessionType: SessionType;
  timeRemaining: number;
  totalSeconds: number;
  completedSessions: number;
  todayFocusMinutes: number;
  sessions: FocusSession[];
  settings: FocusSettings;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSettings: (s: Partial<FocusSettings>) => void;
}

const FocusContext = createContext<FocusContextType | null>(null);
const SESSIONS_KEY = "@habitflow_focus_sessions";

const DEFAULT_SETTINGS: FocusSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_SETTINGS);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback((type: SessionType, s: FocusSettings) => {
    if (type === "focus") return s.focusDuration * 60;
    if (type === "short_break") return s.shortBreakDuration * 60;
    return s.longBreakDuration * 60;
  }, []);

  const totalSeconds = getDuration(sessionType, settings);

  useEffect(() => {
    AsyncStorage.getItem(SESSIONS_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data) as FocusSession[];
          if (Array.isArray(parsed)) setSessions(parsed);
        } catch {
          // corrupted storage data — start with empty sessions
        }
      }
    }).catch(() => {
      // storage read failed — start with empty sessions
    });
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isPaused]);

  const handleSessionComplete = () => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      type: sessionType,
      duration: getDuration(sessionType, settings),
      completedAt: new Date().toISOString(),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated)).catch(() => {
      // storage write failed — in-memory state still updated
    });

    if (sessionType === "focus") {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      const nextType = newCount % settings.sessionsBeforeLongBreak === 0 ? "long_break" : "short_break";
      setSessionType(nextType);
      setTimeRemaining(getDuration(nextType, settings));
    } else {
      setSessionType("focus");
      setTimeRemaining(getDuration("focus", settings));
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  const start = () => { setIsRunning(true); setIsPaused(false); };
  const pause = () => setIsPaused((p) => !p);
  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(getDuration(sessionType, settings));
  };
  const skip = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (sessionType === "focus") {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      const nextType = newCount % settings.sessionsBeforeLongBreak === 0 ? "long_break" : "short_break";
      setSessionType(nextType);
      setTimeRemaining(getDuration(nextType, settings));
    } else {
      setSessionType("focus");
      setTimeRemaining(getDuration("focus", settings));
    }
  };

  const updateSettings = (s: Partial<FocusSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    setTimeRemaining(getDuration(sessionType, updated));
    setIsRunning(false);
    setIsPaused(false);
  };

  // Compare session dates in local time to avoid UTC day-boundary mismatches
  const todayFocusMinutes = sessions.filter((s) => {
    const sessionDate = new Date(s.completedAt);
    const now = new Date();
    return (
      s.type === "focus" &&
      sessionDate.getFullYear() === now.getFullYear() &&
      sessionDate.getMonth() === now.getMonth() &&
      sessionDate.getDate() === now.getDate()
    );
  }).reduce((acc, s) => acc + s.duration / 60, 0);

  return (
    <FocusContext.Provider value={{ isRunning, isPaused, sessionType, timeRemaining, totalSeconds, completedSessions, todayFocusMinutes, sessions, settings, start, pause, reset, skip, updateSettings }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used within FocusProvider");
  return ctx;
}
