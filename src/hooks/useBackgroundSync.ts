import { useState, useEffect, useCallback } from "react";
import {
  getOfflineQueue,
  queueOfflineAction,
  removeOfflineAction,
  clearOfflineQueue,
  syncOfflineActions,
  getLastSyncTime,
  initBackgroundSyncAutoListener,
  OfflineAction,
  OfflineActionType,
} from "@/lib/offlineSync";
import { useToast } from "@/hooks/use-toast";

export function useBackgroundSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(getLastSyncTime());
  const { toast } = useToast();

  const refreshQueue = useCallback(() => {
    setPendingActions(getOfflineQueue());
    setLastSyncTime(getLastSyncTime());
  }, []);

  useEffect(() => {
    // Ensure automatic listener is initialized
    initBackgroundSyncAutoListener();
    refreshQueue();

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueUpdated = () => {
      refreshQueue();
    };

    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = (e: any) => {
      setIsSyncing(false);
      refreshQueue();
      const detail = e.detail;
      if (detail && detail.syncedCount > 0) {
        toast({
          title: "Background Sync Complete",
          description: `Successfully pushed ${detail.syncedCount} offline action${
            detail.syncedCount === 1 ? "" : "s"
          } to the backend.`,
        });
      }
    };

    const handleSyncFailed = (e: any) => {
      setIsSyncing(false);
      refreshQueue();
      toast({
        title: "Sync Delayed",
        description: e.detail?.error || "Could not push actions. Will retry automatically.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("knowdeep_offline_queue_updated", handleQueueUpdated);
    window.addEventListener("knowdeep_sync_started", handleSyncStarted);
    window.addEventListener("knowdeep_sync_completed", handleSyncCompleted);
    window.addEventListener("knowdeep_sync_failed", handleSyncFailed);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("knowdeep_offline_queue_updated", handleQueueUpdated);
      window.removeEventListener("knowdeep_sync_started", handleSyncStarted);
      window.removeEventListener("knowdeep_sync_completed", handleSyncCompleted);
      window.removeEventListener("knowdeep_sync_failed", handleSyncFailed);
    };
  }, [refreshQueue, toast]);

  const queueAction = useCallback(
    (
      type: OfflineActionType,
      payload: any,
      metadata?: { userId?: string; conversationId?: string; summary?: string; title?: string }
    ) => {
      const action = queueOfflineAction({ type, payload, metadata });
      refreshQueue();
      return action;
    },
    [refreshQueue]
  );

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncOfflineActions();
      refreshQueue();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshQueue]);

  const clearQueue = useCallback(() => {
    clearOfflineQueue();
    refreshQueue();
  }, [refreshQueue]);

  const removeAction = useCallback(
    (id: string) => {
      removeOfflineAction(id);
      refreshQueue();
    },
    [refreshQueue]
  );

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    lastSyncTime,
    queueAction,
    syncNow,
    clearQueue,
    removeAction,
    refreshQueue,
  };
}
