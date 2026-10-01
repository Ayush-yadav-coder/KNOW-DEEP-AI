import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
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
  defaultModel: "gemini-3.8-flash" | "gemini-flash-latest" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite" | "kd-2-fast" | "kd-2-pro" | "kd-2.5-pro" | string;
  voice: "Adam" | "Kore" | "Puck" | "Rachel" | "Zephyr" | "Charon" | "Antony" | "Fenrir" | string;
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
  fetchConversations: () => Promise<void>;
  addConversation: (conv: ChatConversation) => void;
  removeConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  pinConversation: (id: string, pinned?: boolean) => void;
  setUserMemory: (mem: UserMemoryFact[]) => void;
  addMemoryFact: (key: string, value: string) => void;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
  resetStore: () => void;
}

export const getInitialDisplayName = (): string => {
  if (typeof window === "undefined") return "Ayush";
  try {
    const dedicated =
      localStorage.getItem("knowdeep_display_name") ||
      localStorage.getItem("knowdeep_user_name");
    if (dedicated && dedicated.trim() && dedicated.trim().toLowerCase() !== "explorer") {
      return dedicated.trim();
    }
    const saved = localStorage.getItem("knowdeep_preferences");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.displayName &&
        parsed.displayName.trim() &&
        parsed.displayName.trim().toLowerCase() !== "explorer"
      ) {
        return parsed.displayName.trim();
      }
    }
    const secureAuthSession = localStorage.getItem("knowdeep_secure_session");
    if (secureAuthSession) {
      const parsed = JSON.parse(secureAuthSession);
      const name = parsed?.user?.displayName || parsed?.user?.user_metadata?.display_name;
      if (name && name.trim() && name.trim().toLowerCase() !== "explorer") {
        return name.trim();
      }
    }
    if (dedicated && dedicated.trim()) {
      return dedicated.trim();
    }
  } catch (e) {
    console.warn("Could not retrieve initial display name:", e);
  }
  return "Ayush";
};

const DEFAULT_PREFS: AppPreferences = {
  language: "en",
  defaultModel: "gemini-3.1-flash-lite",
  voice: "Rachel",
  theme: "dark",
  systemInstructions: "",
  displayName: getInitialDisplayName(),
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

const getSavedConversations = (): ChatConversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("knowdeep_conversations") || localStorage.getItem("guest_conversations");
    const pinnedSet = new Set(JSON.parse(localStorage.getItem("pinned_conversations") || "[]"));
    if (saved) {
      const parsed: ChatConversation[] = JSON.parse(saved);
      return parsed.map((c) => ({
        ...c,
        pinned: c.pinned ?? pinnedSet.has(c.id),
      }));
    }
  } catch (e) {
    console.warn("Could not load initial conversations:", e);
  }
  return [];
};

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isGuest: typeof window !== "undefined" && localStorage.getItem("guest_mode") === "true",
  isSidebarOpen: false,
  currentConversationId: null,
  conversations: getSavedConversations(),
  userMemory: [],
  preferences: (() => {
    try {
      const initialName = getInitialDisplayName();
      const saved = localStorage.getItem("knowdeep_preferences");

      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.defaultModel ||
          parsed.defaultModel === "gemini-3.8-flash" ||
          parsed.defaultModel.includes("1.5") ||
          parsed.defaultModel.includes("2.0") ||
          parsed.defaultModel.includes("2.5") ||
          parsed.defaultModel.includes("3.5") ||
          parsed.defaultModel.includes("3.8")
        ) {
          parsed.defaultModel = "gemini-3.1-flash-lite";
        }
        const resolvedName =
          initialName && initialName.toLowerCase() !== "explorer"
            ? initialName
            : parsed.displayName && parsed.displayName.toLowerCase() !== "explorer"
            ? parsed.displayName
            : initialName || "Ayush";

        return {
          ...DEFAULT_PREFS,
          ...parsed,
          displayName: resolvedName,
        };
      }
      return {
        ...DEFAULT_PREFS,
        displayName: initialName,
      };
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
  
  setConversations: (conversations) => {
    set({ conversations });
    try {
      localStorage.setItem("knowdeep_conversations", JSON.stringify(conversations));
      localStorage.setItem("guest_conversations", JSON.stringify(conversations));
    } catch (e) {
      console.warn("Could not sync conversations to localStorage:", e);
    }
  },

  fetchConversations: async () => {
    const user = get().user;
    let pinnedSet = new Set<string>();
    try {
      pinnedSet = new Set(JSON.parse(localStorage.getItem("pinned_conversations") || "[]"));
    } catch {
      pinnedSet = new Set();
    }

    if (!user) {
      const local = getSavedConversations();
      set({ conversations: local });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: ChatConversation[] = (data || []).map((c: any) => ({
        id: c.id,
        title: c.title || "New Conversation",
        created_at: c.created_at,
        updated_at: c.updated_at,
        pinned: pinnedSet.has(c.id),
      }));

      // Sort pinned first, then newest
      mapped.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      set({ conversations: mapped });
      try {
        localStorage.setItem("knowdeep_conversations", JSON.stringify(mapped));
      } catch (storageErr) {
        console.warn("Storage warning:", storageErr);
      }
    } catch (err) {
      console.warn("Could not fetch remote conversations, using local:", err);
      set({ conversations: getSavedConversations() });
    }
  },

  addConversation: (conv) => {
    const existing = get().conversations.filter((c) => c.id !== conv.id);
    const updated = [conv, ...existing];
    set({ conversations: updated });
    try {
      localStorage.setItem("knowdeep_conversations", JSON.stringify(updated));
      localStorage.setItem("guest_conversations", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save new conversation to localStorage:", e);
    }
  },

  removeConversation: (id) => {
    const updated = get().conversations.filter((c) => c.id !== id);
    set((state) => ({
      conversations: updated,
      currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
    }));
    try {
      localStorage.setItem("knowdeep_conversations", JSON.stringify(updated));
      localStorage.setItem("guest_conversations", JSON.stringify(updated));
      localStorage.removeItem(`guest_msgs_${id}`);
    } catch (e) {
      console.warn("Could not remove conversation from localStorage:", e);
    }
  },

  updateConversation: (id, updates) => {
    const updated = get().conversations.map((c) => (c.id === id ? { ...c, ...updates } : c));
    set({ conversations: updated });
    try {
      localStorage.setItem("knowdeep_conversations", JSON.stringify(updated));
      localStorage.setItem("guest_conversations", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not update conversation in localStorage:", e);
    }
  },

  pinConversation: (id, pinned) => {
    let pinnedSet = new Set<string>();
    try {
      pinnedSet = new Set(JSON.parse(localStorage.getItem("pinned_conversations") || "[]"));
    } catch (err) {
      console.warn("Failed to parse pinned conversations:", err);
    }

    const targetConv = get().conversations.find((c) => c.id === id);
    const isNowPinned = pinned !== undefined ? pinned : !(targetConv?.pinned || pinnedSet.has(id));

    if (isNowPinned) {
      pinnedSet.add(id);
    } else {
      pinnedSet.delete(id);
    }

    try {
      localStorage.setItem("pinned_conversations", JSON.stringify(Array.from(pinnedSet)));
    } catch (err) {
      console.warn("Failed to persist pinned conversations:", err);
    }

    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, pinned: isNowPinned } : c
    );

    // Re-sort: pinned on top, then by created_at
    updated.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    set({ conversations: updated });
    try {
      localStorage.setItem("knowdeep_conversations", JSON.stringify(updated));
      localStorage.setItem("guest_conversations", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist conversations:", err);
    }
  },

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
    if (newPrefs.displayName && newPrefs.displayName.trim()) {
      const cleanName = newPrefs.displayName.trim();
      updated.displayName = cleanName;
      try {
        localStorage.setItem("knowdeep_display_name", cleanName);
        localStorage.setItem("knowdeep_user_name", cleanName);
      } catch (e) {
        console.warn("Could not save display name:", e);
      }
    }
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
        if (newPrefs.displayName) {
          window.dispatchEvent(
            new CustomEvent("knowdeep_name_updated", {
              detail: { name: newPrefs.displayName },
            })
          );
        }
      }
    } catch (e) {
      console.warn("Could not save preferences to localStorage:", e);
    }
  },
  resetStore: () => {
    localStorage.removeItem("guest_mode");
    const preservedName = getInitialDisplayName();
    set({
      user: null,
      session: null,
      isGuest: false,
      isSidebarOpen: false,
      currentConversationId: null,
      conversations: [],
      userMemory: [],
      preferences: {
        ...DEFAULT_PREFS,
        displayName: preservedName,
      },
    });
  },
}));

// Initialize Supabase Auth listener to keep Zustand in sync
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    const user = session?.user ?? null;
    const authName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name;
    if (authName && authName.trim() && authName.trim().toLowerCase() !== "explorer") {
      try {
        localStorage.setItem("knowdeep_display_name", authName.trim());
        localStorage.setItem("knowdeep_user_name", authName.trim());
      } catch (e) {
        console.warn("Could not save display name on session load:", e);
      }
      useAppStore.getState().updatePreferences({ displayName: authName.trim() });
    }
    useAppStore.setState({
      session,
      user,
      isLoading: false,
      isGuest: !session?.user && localStorage.getItem("guest_mode") === "true",
    });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    const authName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name;
    if (authName && authName.trim() && authName.trim().toLowerCase() !== "explorer") {
      try {
        localStorage.setItem("knowdeep_display_name", authName.trim());
        localStorage.setItem("knowdeep_user_name", authName.trim());
      } catch (e) {
        console.warn("Could not save display name on auth change:", e);
      }
      useAppStore.getState().updatePreferences({ displayName: authName.trim() });
    }
    useAppStore.setState({
      session,
      user,
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
