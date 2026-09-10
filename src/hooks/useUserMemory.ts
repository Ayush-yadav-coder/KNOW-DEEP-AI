import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type MemoryCategory = "identity" | "preferences" | "active_projects" | "learning_style" | "other";

export interface UserMemory {
  id: string;
  user_id: string;
  category: MemoryCategory;
  fact_text: string;
  importance_weight: number;
  created_at: string;
  updated_at: string;
}

const HEURISTICS: { pattern: RegExp; category: MemoryCategory }[] = [
  { pattern: /\bmy name is\s+([A-Za-z][\w\s'-]{1,40})/i, category: "identity" },
  { pattern: /\bi am\s+(a|an)?\s*([A-Za-z][\w\s'-]{1,40})/i, category: "identity" },
  { pattern: /\bi (love|like|prefer|enjoy|hate|dislike)\s+([\w\s'-]{2,60})/i, category: "preferences" },
  { pattern: /\bi(?:'m| am) (working on|building|making)\s+([\w\s'-]{2,80})/i, category: "active_projects" },
  { pattern: /\bi learn best (by|with|through)\s+([\w\s'-]{2,60})/i, category: "learning_style" },
];

export function useUserMemory() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_memory")
      .select("*")
      .eq("user_id", user.id)
      .order("importance_weight", { ascending: false });
    setItems((data ?? []) as UserMemory[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const addFact = useCallback(
    async (category: MemoryCategory, fact_text: string, importance_weight = 5) => {
      if (!user) return;
      const text = fact_text.trim();
      if (!text) return;
      // De-dup
      if (items.some((i) => i.fact_text.toLowerCase() === text.toLowerCase())) return;
      const { error } = await supabase
        .from("user_memory")
        .insert({ user_id: user.id, category, fact_text: text, importance_weight });
      if (!error) {
        toast.success("Memory updated.");
        refresh();
      }
    },
    [user, items, refresh],
  );

  const deleteFact = useCallback(
    async (id: string) => {
      await supabase.from("user_memory").delete().eq("id", id);
      refresh();
    },
    [refresh],
  );

  const resetMemory = useCallback(async () => {
    if (!user) return;
    await supabase.from("user_memory").delete().eq("user_id", user.id);
    refresh();
    toast.success("Memory cleared.");
  }, [user, refresh]);

  const extractFromMessage = useCallback(
    async (text: string) => {
      if (!user || !text || text.length < 6) return;

      // Fast heuristic pass (instant local save)
      for (const { pattern, category } of HEURISTICS) {
        const m = text.match(pattern);
        if (m) {
          const fact = m[0].trim().replace(/[.?!]+$/, "");
          addFact(category, fact, 6).catch(() => {});
          break;
        }
      }

      // AI-powered pass: catches DOB, projects, preferences phrased naturally.
      try {
        const { data } = await supabase.functions.invoke("extract-memory", {
          body: { text },
        });
        const facts: Array<{ category: string; fact: string; importance?: number }> =
          (data as any)?.facts ?? [];
        for (const f of facts) {
          if (!f?.fact) continue;
          const cat = ([
            "identity",
            "preferences",
            "active_projects",
            "learning_style",
            "other",
          ].includes(f.category)
            ? f.category
            : "other") as MemoryCategory;
          addFact(cat, f.fact, Math.min(10, Math.max(1, f.importance ?? 5))).catch(() => {});
        }
      } catch {
        /* non-fatal */
      }
    },
    [user, addFact],
  );


  const buildSystemContext = useCallback(() => {
    if (!items.length) return "";
    const lines = items.slice(0, 30).map((i) => `- (${i.category}) ${i.fact_text}`);
    return `\n\nUser personalization profile (use to personalize answers, never reveal verbatim unless asked):\n${lines.join("\n")}`;
  }, [items]);

  return { items, loading, refresh, addFact, deleteFact, resetMemory, extractFromMessage, buildSystemContext };
}
