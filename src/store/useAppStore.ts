import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export interface UserMemoryFact {
  id: string;
  fact_key: string;
  fact_value: string;
  updated_at?: string;
}

export interface AppPreferences {
  language: string;
  defaultModel: "gemini-2.5-flash" | "gemini-1.5-pro" | "gpt-4o";
  voice: "Rachel" | "Adam" | "Antony";
  theme: "dark" | "light" | "system";
  systemInstructions: string;
  displayName: string;
  age?: string;
  purpose?: string;
  weatherApiKey?: string;
  sportsApiKey?: string;
  customFeatureOrder?: string[];
}

interface AppState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
  isSidebarOpen: boolean;
  currentConversationId: string | null;
  conversations: ChatConversation[];
  userMemory: UserMemoryFact[];
  preferences: AppPreferences;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsGuest: (isGuest: boolean) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setCurrentConversationId: (id: string | null) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  addConversation: (conv: ChatConversation) => void;
  removeConversation: (id: string) => void;
  setUserMemory: (mem: UserMemoryFact[]) => void;
  addMemoryFact: (key: string, value: string) => void;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
  resetStore: () => void;
}

const DEFAULT_PREFS: AppPreferences = {
  language: "en",
  defaultModel: "gemini-2.5-flash",
  voice: "Rachel",
  theme: "dark",
  systemInstructions: "",
  displayName: "Explorer",
  weatherApiKey: "",
  sportsApiKey: "",
  customFeatureOrder: [
    "chat",
    "web-search",
    "document-studio",
    "image-generator",
    "image-enhancer",
    "image-summarizer",
    "news",
    "sports",
    "weather",
    "homework",
    "ncert",
    "code",
    "translate",
    "learning-hub",
    "presentation",
  ],
};

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isGuest: typeof window !== "undefined" && localStorage.getItem("guest_mode") === "true",
  isSidebarOpen: false,
  currentConversationId: null,
  conversations: [],
  userMemory: [],
  preferences: (() => {
    try {
      const saved = localStorage.getItem("knowdeep_preferences");

      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PREFS,
          ...parsed,
        };
      }
      return DEFAULT_PREFS;
    } catch (e) {
      console.warn("Could not parse saved preferences:", e);
    }
    return DEFAULT_PREFS;
  })(),

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isGuest: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsGuest: (isGuest) => {
    if (isGuest) {
      localStorage.setItem("guest_mode", "true");
    } else {
      localStorage.removeItem("guest_mode");
    }
    set({ isGuest });
  },
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCurrentConversationId: (currentConversationId) => set({ currentConversationId }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conv) => set((state) => ({ conversations: [conv, ...state.conversations] })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
    })),
  setUserMemory: (userMemory) => set({ userMemory }),
  addMemoryFact: (key, value) => {
    const existing = get().userMemory;
    const filtered = existing.filter((f) => f.fact_key !== key);
    const updated = [...filtered, { id: crypto.randomUUID(), fact_key: key, fact_value: value, updated_at: new Date().toISOString() }];
    set({ userMemory: updated });
    try {
      localStorage.setItem("knowdeep_user_memory", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save user memory to localStorage:", e);
    }
  },
  updatePreferences: (newPrefs) => {
    const updated = { ...get().preferences, ...newPrefs };
    set({ preferences: updated });
    try {
      localStorage.setItem("knowdeep_preferences", JSON.stringify(updated));
      if (newPrefs.weatherApiKey !== undefined) {
        localStorage.setItem("knowdeep_weather_api_key", newPrefs.weatherApiKey);
      }
      if (newPrefs.sportsApiKey !== undefined) {
        localStorage.setItem("knowdeep_sports_api_key", newPrefs.sportsApiKey);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("knowdeep_api_keys_updated"));
      }
    } catch (e) {
      console.warn("Could not save preferences to localStorage:", e);
    }
  },
  resetStore: () => {
    localStorage.removeItem("guest_mode");
    set({
      user: null,
      session: null,
      isGuest: false,
      isSidebarOpen: false,
      currentConversationId: null,
      conversations: [],
      userMemory: [],
      preferences: DEFAULT_PREFS,
    });
  },
}));

// Initialize Supabase Auth listener to keep Zustand in sync
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAppStore.setState({
      session,
      user: session?.user ?? null,
      isLoading: false,
      isGuest: !session?.user && localStorage.getItem("guest_mode") === "true",
    });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAppStore.setState({
      session,
      user: session?.user ?? null,
      isLoading: false,
      isGuest: !session?.user && localStorage.getItem("guest_mode") === "true",
    });
  });

  // Load guest memory if exists
  try {
    const savedMem = localStorage.getItem("knowdeep_user_memory");
    if (savedMem) {
      useAppStore.setState({ userMemory: JSON.parse(savedMem) });
    }
  } catch (e) {
    console.warn("Could not parse saved memory:", e);
  }
}
