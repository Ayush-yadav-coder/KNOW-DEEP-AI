import { supabase } from "@/integrations/supabase/client";

export type OfflineActionType =
  | "CHAT_MESSAGE"
  | "CREATE_CONVERSATION"
  | "UPDATE_CONVERSATION"
  | "DELETE_CONVERSATION"
  | "USER_MEMORY_ADD"
  | "USER_MEMORY_DELETE"
  | "UPDATE_PROFILE"
  | "UPDATE_PREFERENCES"
  | "SUBMIT_FEEDBACK"
  | "BOOKMARK_NEWS"
  | "CUSTOM_ACTION";

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  timestamp: number;
  status: "pending" | "syncing" | "failed" | "completed";
  retryCount: number;
  error?: string;
  metadata?: {
    userId?: string;
    conversationId?: string;
    summary?: string;
    title?: string;
  };
}

export const OFFLINE_QUEUE_KEY = "knowdeep_offline_action_queue";
export const LAST_SYNC_KEY = "knowdeep_last_sync_timestamp";

/**
 * Retrieves all queued offline actions from LocalStorage.
 */
export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[OfflineSync] Failed to parse offline action queue:", err);
    return [];
  }
}

/**
 * Saves the full queue to LocalStorage and dispatches an update event.
 */
function saveQueue(queue: OfflineAction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(
      new CustomEvent("knowdeep_offline_queue_updated", {
        detail: { count: queue.length, queue },
      })
    );
  } catch (err) {
    console.error("[OfflineSync] Failed to save offline action queue to LocalStorage:", err);
  }
}

/**
 * Stores a new user action in LocalStorage while offline.
 */
export function queueOfflineAction(
  actionData: Omit<OfflineAction, "id" | "timestamp" | "status" | "retryCount"> & {
    id?: string;
  }
): OfflineAction {
  const newAction: OfflineAction = {
    id: actionData.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
    type: actionData.type,
    payload: actionData.payload,
    timestamp: Date.now(),
    status: "pending",
    retryCount: 0,
    metadata: actionData.metadata,
  };

  const currentQueue = getOfflineQueue();
  // Prevent exact duplicate action if identical ID already queued
  const filtered = currentQueue.filter((a) => a.id !== newAction.id);
  const updatedQueue = [...filtered, newAction];

  saveQueue(updatedQueue);
  console.log(`[OfflineSync] Queued action "${newAction.type}" in LocalStorage (${updatedQueue.length} total pending)`);

  return newAction;
}

/**
 * Removes a specific action from the LocalStorage queue by ID.
 */
export function removeOfflineAction(id: string) {
  const currentQueue = getOfflineQueue();
  const updatedQueue = currentQueue.filter((a) => a.id !== id);
  saveQueue(updatedQueue);
}

/**
 * Updates properties of an action in the LocalStorage queue.
 */
export function updateActionInQueue(id: string, updates: Partial<OfflineAction>) {
  const currentQueue = getOfflineQueue();
  const updatedQueue = currentQueue.map((a) => (a.id === id ? { ...a, ...updates } : a));
  saveQueue(updatedQueue);
}

/**
 * Clears the entire offline action queue from LocalStorage.
 */
export function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  window.dispatchEvent(
    new CustomEvent("knowdeep_offline_queue_updated", {
      detail: { count: 0, queue: [] },
    })
  );
}

/**
 * Gets the timestamp of the last successful background sync.
 */
export function getLastSyncTime(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Push an individual action to Supabase if applicable and user has rights.
 */
async function syncActionToSupabase(action: OfflineAction): Promise<boolean> {
  try {
    switch (action.type) {
      case "CHAT_MESSAGE": {
        const { conversationId, role, content, userId } = action.payload || {};
        if (conversationId && role && content) {
          const { error } = await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            role,
            content,
            user_id: userId || (await supabase.auth.getUser()).data.user?.id || "",
          });
          if (error) {
            console.warn("[OfflineSync] Supabase chat_messages insert notice:", error.message);
          }
        }
        return true;
      }

      case "CREATE_CONVERSATION": {
        const { id, title, userId } = action.payload || {};
        if (id) {
          const { error } = await supabase.from("chat_conversations").insert({
            id,
            title: title || "New Chat",
            user_id: userId || (await supabase.auth.getUser()).data.user?.id || "",
          });
          if (error) {
            console.warn("[OfflineSync] Supabase chat_conversations insert notice:", error.message);
          }
        }
        return true;
      }

      case "UPDATE_CONVERSATION": {
        const { id, title } = action.payload || {};
        if (id && title) {
          const { error } = await supabase
            .from("chat_conversations")
            .update({ title })
            .eq("id", id);
          if (error) {
            console.warn("[OfflineSync] Supabase chat_conversations update notice:", error.message);
          }
        }
        return true;
      }

      case "DELETE_CONVERSATION": {
        const { id } = action.payload || {};
        if (id) {
          const { error } = await supabase.from("chat_conversations").delete().eq("id", id);
          if (error) {
            console.warn("[OfflineSync] Supabase chat_conversations delete notice:", error.message);
          }
        }
        return true;
      }

      case "USER_MEMORY_ADD": {
        const { fact_text, category, userId } = action.payload || {};
        if (fact_text) {
          const { error } = await supabase.from("user_memory").insert({
            fact_text,
            category: category || "general",
            user_id: userId || (await supabase.auth.getUser()).data.user?.id || "",
          });
          if (error) {
            console.warn("[OfflineSync] Supabase user_memory insert notice:", error.message);
          }
        }
        return true;
      }

      case "USER_MEMORY_DELETE": {
        const { id } = action.payload || {};
        if (id) {
          const { error } = await supabase.from("user_memory").delete().eq("id", id);
          if (error) {
            console.warn("[OfflineSync] Supabase user_memory delete notice:", error.message);
          }
        }
        return true;
      }

      case "SUBMIT_FEEDBACK": {
        const { message, email, page } = action.payload || {};
        if (message) {
          const user = (await supabase.auth.getUser()).data.user;
          const { error } = await supabase.from("feedback").insert({
            message,
            email: email || user?.email || null,
            page: page || "/chat",
            user_id: user?.id || null,
          });
          if (error) {
            console.warn("[OfflineSync] Supabase feedback insert notice:", error.message);
          }
        }
        return true;
      }

      case "UPDATE_PROFILE": {
        const { displayName, avatarUrl } = action.payload || {};
        const user = (await supabase.auth.getUser()).data.user;
        if (user?.id) {
          const { error } = await supabase
            .from("profiles")
            .update({
              display_name: displayName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
          if (error) {
            console.warn("[OfflineSync] Supabase profile update notice:", error.message);
          }
        }
        return true;
      }

      default:
        return true;
    }
  } catch (supabaseErr) {
    console.warn(`[OfflineSync] Supabase push skipped for ${action.type}:`, supabaseErr);
    return true; // Still allow backend HTTP sync to proceed
  }
}

let isSyncInProgress = false;

/**
 * Automatically pushes all queued actions from LocalStorage to the backend.
 * Called automatically once an internet connection is restored or on demand.
 */
export async function syncOfflineActions(): Promise<{
  synced: number;
  failed: number;
  total: number;
}> {
  if (typeof window === "undefined") return { synced: 0, failed: 0, total: 0 };

  // Guard against concurrent sync runs
  if (isSyncInProgress) {
    console.log("[OfflineSync] Sync already in progress, skipping overlapping invocation.");
    return { synced: 0, failed: 0, total: getOfflineQueue().length };
  }

  // Check connectivity
  if (!navigator.onLine) {
    console.log("[OfflineSync] Device is still offline, cannot push actions yet.");
    return { synced: 0, failed: 0, total: getOfflineQueue().length };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, total: 0 };
  }

  isSyncInProgress = true;
  console.log(`[OfflineSync] Connection restored! Pushing ${queue.length} action(s) to the backend...`);

  window.dispatchEvent(
    new CustomEvent("knowdeep_sync_started", {
      detail: { count: queue.length },
    })
  );

  // Mark pending actions as syncing
  queue.forEach((action) => {
    updateActionInQueue(action.id, { status: "syncing" });
  });

  let syncedCount = 0;
  let failedCount = 0;
  const successfulActionIds: string[] = [];

  try {
    // 1. Replay relevant actions to Supabase tables
    for (const action of queue) {
      try {
        await syncActionToSupabase(action);
      } catch (err) {
        console.warn(`[OfflineSync] Error syncing action ${action.id} to Supabase:`, err);
      }
    }

    // 2. Batch push all actions to our backend API (/api/sync/actions)
    const res = await fetch("/api/sync/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: queue,
        clientTimestamp: Date.now(),
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend sync API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    console.log("[OfflineSync] Backend responded:", data);

    const results: Array<{ id: string; status: string; error?: string }> = data.results || [];
    const resultMap = new Map(results.map((r) => [r.id, r]));

    for (const action of queue) {
      const result = resultMap.get(action.id);
      if (!result || result.status === "synced") {
        successfulActionIds.push(action.id);
        syncedCount++;
      } else {
        failedCount++;
        updateActionInQueue(action.id, {
          status: "failed",
          retryCount: action.retryCount + 1,
          error: result.error || "Backend sync failed",
        });
      }
    }

    // Remove successfully pushed actions from LocalStorage queue
    if (successfulActionIds.length > 0) {
      const remainingQueue = getOfflineQueue().filter(
        (a) => !successfulActionIds.includes(a.id)
      );
      saveQueue(remainingQueue);
    }

    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, nowIso);

    window.dispatchEvent(
      new CustomEvent("knowdeep_sync_completed", {
        detail: {
          syncedCount,
          failedCount,
          total: queue.length,
          timestamp: nowIso,
        },
      })
    );

    console.log(
      `[OfflineSync] Sync completed: ${syncedCount} synced, ${failedCount} failed.`
    );
  } catch (error: any) {
    console.error("[OfflineSync] Network or server error during background sync:", error);
    failedCount = queue.length;
    queue.forEach((action) => {
      updateActionInQueue(action.id, {
        status: "failed",
        retryCount: action.retryCount + 1,
        error: error.message || "Network error",
      });
    });

    window.dispatchEvent(
      new CustomEvent("knowdeep_sync_failed", {
        detail: { error: error.message, count: queue.length },
      })
    );
  } finally {
    isSyncInProgress = false;
  }

  return { synced: syncedCount, failed: failedCount, total: queue.length };
}

/**
 * Initializes global browser event listeners for online reconnection,
 * window focus, and background periodic check.
 */
let autoListenerInitialized = false;

export function initBackgroundSyncAutoListener() {
  if (typeof window === "undefined" || autoListenerInitialized) return;
  autoListenerInitialized = true;

  // 1. The core requirement: Push automatically once internet connection is restored!
  window.addEventListener("online", () => {
    console.log("[OfflineSync] Online event detected! Triggering background sync push...");
    // Slight pause to ensure socket/DNS routes are warm
    setTimeout(() => {
      syncOfflineActions();
    }, 400);
  });

  window.addEventListener("offline", () => {
    console.log("[OfflineSync] Offline event detected! User actions will be saved in LocalStorage.");
    window.dispatchEvent(
      new CustomEvent("knowdeep_offline_status_changed", {
        detail: { isOnline: false },
      })
    );
  });

  // 2. Window focus check (e.g. user toggled airplane mode and came back)
  window.addEventListener("focus", () => {
    if (navigator.onLine && getOfflineQueue().length > 0) {
      syncOfflineActions();
    }
  });

  // 3. Periodic fallback sync if online and items exist in queue
  setInterval(() => {
    if (navigator.onLine && getOfflineQueue().length > 0 && !isSyncInProgress) {
      syncOfflineActions();
    }
  }, 45000);

  // Initial check on page load if online with leftover queued actions
  if (navigator.onLine && getOfflineQueue().length > 0) {
    setTimeout(() => {
      syncOfflineActions();
    }, 1200);
  }
}
