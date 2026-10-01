import React, { useState } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CloudUpload,
  CheckCircle2,
  Trash2,
  ListFilter,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { SyncQueueModal } from "./SyncQueueModal";
import { clearOfflineQueue } from "@/lib/offlineSync";
import { useToast } from "@/hooks/use-toast";

export function OfflineSyncSettingsSection() {
  const { isOnline, pendingCount, isSyncing, lastSyncTime, syncNow } = useBackgroundSync();
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const { toast } = useToast();

  const handleClear = () => {
    clearOfflineQueue();
    toast({
      title: "Offline Storage Cleared",
      description: "Pending offline actions have been cleared from LocalStorage.",
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              Offline Storage & Background Sync
            </span>

            {/* Sync Active Pill */}
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                !isOnline
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : isSyncing
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
              </span>
              {isSyncing
                ? "Syncing in Progress"
                : !isOnline
                ? "Offline Mode Active"
                : "Sync Active & Ready"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            User prompts, messages, and feature actions are securely cached in LocalStorage when
            internet access is interrupted, and seamlessly pushed to the backend upon reconnection.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-background border border-border text-xs font-mono">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-semibold">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Stats and Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <div className="p-3 rounded-xl bg-background/60 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Pending Queue
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-foreground">{pendingCount}</span>
            <span className="text-xs text-muted-foreground">actions</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background/60 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Last Successful Sync
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Never in this session"}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background/60 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Storage Engine
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Encrypted LocalStorage</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncNow()}
            disabled={!isOnline || pendingCount === 0 || isSyncing}
            className="h-8 text-xs rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
            )}
            Push Pending Now ({pendingCount})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsQueueModalOpen(true)}
            className="h-8 text-xs rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ListFilter className="w-3.5 h-3.5 mr-1.5" />
            View Queue
          </Button>
        </div>

        {pendingCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-8 text-xs rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear Queue
          </Button>
        )}
      </div>

      <SyncQueueModal isOpen={isQueueModalOpen} onClose={() => setIsQueueModalOpen(false)} />
    </div>
  );
}
