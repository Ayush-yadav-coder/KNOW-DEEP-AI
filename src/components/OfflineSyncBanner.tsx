import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, Database, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { SyncQueueModal } from "./SyncQueueModal";

export function OfflineSyncBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useBackgroundSync();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user is online and no actions are currently syncing or pending, we can hide the banner
  const showBanner = !isOnline || isSyncing || (isOnline && pendingCount > 0);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`w-full border-b px-3 py-2 text-xs font-medium z-30 transition-colors ${
              !isOnline
                ? "bg-amber-500/15 border-amber-500/30 text-amber-200"
                : isSyncing
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-200"
                : "bg-blue-500/15 border-blue-500/30 text-blue-200"
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {!isOnline ? (
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <RefreshCw
                    className={`w-4 h-4 text-cyan-400 shrink-0 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                )}

                <span>
                  {!isOnline ? (
                    <>
                      <strong className="font-semibold text-amber-300">Offline Mode:</strong>{" "}
                      Your actions are stored in LocalStorage. They will automatically push to the backend
                      once connection is restored.
                    </>
                  ) : isSyncing ? (
                    <>
                      <strong className="font-semibold text-cyan-300">Connection Restored:</strong>{" "}
                      Pushing {pendingCount} stored action{pendingCount === 1 ? "" : "s"} to the backend...
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-blue-300">Pending Sync:</strong>{" "}
                      {pendingCount} action{pendingCount === 1 ? "" : "s"} waiting to push to backend.
                    </>
                  )}
                </span>

                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/60 border border-current text-[11px] font-bold">
                    <Database className="w-3 h-3" />
                    {pendingCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isOnline && pendingCount > 0 && !isSyncing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncNow()}
                    className="h-6 text-[11px] px-2 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20"
                  >
                    <CloudUpload className="w-3 h-3 mr-1" />
                    Push Now
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsModalOpen(true)}
                  className="h-6 text-[11px] px-2 text-foreground/80 hover:text-foreground hover:bg-background/40"
                >
                  View Queue
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SyncQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

/**
 * Compact Header Sync Button / Indicator for AppLayout
 */
export function HeaderSyncIndicator() {
  const { isOnline, pendingCount, isSyncing } = useBackgroundSync();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`h-8 px-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
          !isOnline
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
            : isSyncing
            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 animate-pulse"
            : pendingCount > 0
            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
        }`}
        title={
          !isOnline
            ? `Offline — ${pendingCount} actions stored in LocalStorage`
            : isSyncing
            ? "Pushing actions to backend..."
            : pendingCount > 0
            ? `${pendingCount} actions pending push`
            : "Offline Sync: Active"
        }
      >
        {!isOnline ? (
          <WifiOff className="w-3.5 h-3.5" />
        ) : isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CloudUpload className="w-3.5 h-3.5" />
        )}

        {(!isOnline || pendingCount > 0) && (
          <span className="text-[11px] font-bold">
            {pendingCount > 0 ? pendingCount : "Offline"}
          </span>
        )}
      </button>

      <SyncQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
