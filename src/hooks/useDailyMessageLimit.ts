import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DAILY_LIMIT = 15;

/**
 * Tracks free-tier daily AI message usage (15/day for Know Deep 2.5 Pro Preview).
 * Pro users (future: read from subscription) bypass entirely.
 */
export function useDailyMessageLimit(isPro = false) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadUsage = async () => {
      if (!user || isPro) {
        setCount(0);
        setLimitReached(false);
        return;
      }
      const { data } = await supabase
        .from("ai_daily_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("usage_date", new Date().toISOString().slice(0, 10))
        .maybeSingle();
      if (!cancelled) {
        const nextCount = data?.message_count ?? 0;
        setCount(nextCount);
        setLimitReached(nextCount >= DAILY_LIMIT);
      }
    };
    void loadUsage();
    return () => { cancelled = true; };
  }, [user, isPro]);

  /**
   * The authoritative reservation happens inside each authenticated AI function.
   * The browser only mirrors the last known count for responsive UI; it must not
   * call the privileged SECURITY DEFINER RPC directly.
   */
  const tryConsume = useCallback(async (): Promise<boolean> => {
    if (isPro) return true;
    if (!user || isChecking) return false;

    if (count >= DAILY_LIMIT) {
      setShowUpgrade(true);
      setLimitReached(true);
      return false;
    }

    setIsChecking(true);
    // The edge function will perform the atomic server-side check. Optimistically
    // mirror the count here so the UI stays responsive while the request starts.
    const nextCount = count + 1;
    setCount(nextCount);
    setLimitReached(nextCount >= DAILY_LIMIT);
    setIsChecking(false);
    return true;
  }, [count, isChecking, isPro, user]);

  return {
    count,
    remaining: Math.max(0, DAILY_LIMIT - count),
    limit: DAILY_LIMIT,
    limitReached,
    isPro,
    tryConsume,
    isChecking,
    showUpgrade,
    setShowUpgrade,
  };
}
