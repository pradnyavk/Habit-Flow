import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Priority = "high" | "medium" | "low";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate?: string;
  completed: boolean;
  subtasks: SubTask[];
  tags: string[];
  createdAt: string;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  getTasksByPriority: (priority: Priority) => Task[];
  pendingCount: number;
}

const TasksContext = createContext<TasksContextType | null>(null);
const STORAGE_KEY = "@habitflow_tasks";

const SAMPLE_TASKS: Task[] = [
  { id: "t1", title: "Complete project proposal", priority: "high", dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], completed: false, subtasks: [{ id: "s1", title: "Write executive summary", completed: true }, { id: "s2", title: "Add budget breakdown", completed: false }], tags: ["Work"], createdAt: new Date().toISOString() },
  { id: "t2", title: "Schedule dentist appointment", priority: "medium", completed: false, subtasks: [], tags: ["Health"], createdAt: new Date().toISOString() },
  { id: "t3", title: "Buy groceries", priority: "low", completed: false, subtasks: [{ id: "s3", title: "Vegetables & fruits", completed: false }, { id: "s4", title: "Protein sources", completed: false }], tags: ["Personal"], createdAt: new Date().toISOString() },
  { id: "t4", title: "Review design mockups", priority: "high", completed: true, subtasks: [], tags: ["Work"], createdAt: new Date().toISOString() },
  { id: "t5", title: "Call mom", priority: "medium", completed: false, subtasks: [], tags: ["Personal"], createdAt: new Date().toISOString() },
];

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data) as Task[];
        if (parsed.length > 0) setTasks(parsed);
      }
    });
  }, []);

  const save = (updated: Task[]) => {
    setTasks(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addTask = (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = { ...task, id: Date.now().toString() + Math.random().toString(36).substr(2, 6), completed: false, createdAt: new Date().toISOString() };
    save([newTask, ...tasks]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    save(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => save(tasks.filter((t) => t.id !== id));

  const toggleTask = (id: string) => {
    save(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    save(tasks.map((t) => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s) };
    }));
  };

  const getTasksByPriority = (priority: Priority) => tasks.filter((t) => t.priority === priority && !t.completed);
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask, getTasksByPriority, pendingCount }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
