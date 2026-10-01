import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  CloudUpload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncQueueModal({ isOpen, onClose }: SyncQueueModalProps) {
  const {
    isOnline,
    pendingActions,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    clearQueue,
    removeAction,
    queueAction,
  } = useBackgroundSync();

  const [testActionType, setTestActionType] = useState<string>("CHAT_MESSAGE");

  if (!isOpen) return null;

  const handleAddTestAction = () => {
    queueAction(
      testActionType as any,
      {
        test: true,
        note: `Manual offline test at ${new Date().toLocaleTimeString()}`,
        content: `Sample offline message created at ${new Date().toLocaleTimeString()}`,
      },
      {
        summary: `Simulated offline action (${testActionType})`,
        title: "Test Offline Action",
      }
    );
  };

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case "CHAT_MESSAGE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CREATE_CONVERSATION":
      case "UPDATE_CONVERSATION":
      case "DELETE_CONVERSATION":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "SUBMIT_FEEDBACK":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "USER_MEMORY_ADD":
      case "USER_MEMORY_DELETE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isOnline
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Offline Sync Engine</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                    }`}
                  />
                  {isOnline ? "Online — Auto-push enabled" : "Offline — Actions queued in LocalStorage"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Info Status Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>LocalStorage Action Queue:</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                    {pendingCount} Pending
                  </span>
                </div>
                {lastSyncTime && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last successful backend push: {new Date(lastSyncTime).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncNow()}
                  disabled={isSyncing || pendingCount === 0 || !isOnline}
                  className="text-xs flex-1 sm:flex-none border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Pushing..." : "Sync Now"}
                </Button>

                {pendingCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearQueue}
                    disabled={isSyncing}
                    className="text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Test Action Generator for preview testing */}
            <div className="p-3.5 rounded-xl border border-dashed border-border/80 bg-background/50 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Add test action:</span>
                <select
                  value={testActionType}
                  onChange={(e) => setTestActionType(e.target.value)}
                  className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground"
                >
                  <option value="CHAT_MESSAGE">Chat Message</option>
                  <option value="SUBMIT_FEEDBACK">Feedback Submission</option>
                  <option value="UPDATE_PREFERENCES">Update Preferences</option>
                  <option value="USER_MEMORY_ADD">User Memory Fact</option>
                </select>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddTestAction}
                className="text-xs h-7 px-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Store In LocalStorage
              </Button>
            </div>

            {/* Queue Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stored Actions ({pendingCount})
              </h4>

              {pendingCount === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto" />
                  <p className="text-sm font-medium text-foreground">All actions are in sync!</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Whenever you take actions while offline (sending prompts, changing settings, writing feedback),
                    they will automatically queue here and sync to the backend upon reconnection.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-3 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getActionBadgeColor(
                              action.type
                            )}`}
                          >
                            {action.type}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </span>
                          {action.status === "syncing" && (
                            <span className="text-cyan-400 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                            </span>
                          )}
                          {action.status === "failed" && (
                            <span className="text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Retry queued
                            </span>
                          )}
                        </div>

                        <p className="text-foreground/90 font-medium truncate">
                          {action.metadata?.summary ||
                            action.metadata?.title ||
                            (action.payload?.content
                              ? `Message: "${action.payload.content.slice(0, 50)}..."`
                              : action.payload?.message
                              ? `Feedback: "${action.payload.message.slice(0, 50)}..."`
                              : JSON.stringify(action.payload).slice(0, 60))}
                        </p>

                        <div className="text-[10px] text-muted-foreground/80 font-mono">
                          ID: {action.id.slice(0, 16)}...
                        </div>
                      </div>

                      <button
                        onClick={() => removeAction(action.id)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-muted transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4 text-cyan-400" />
              Automatic Background Replay: Active
            </span>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
