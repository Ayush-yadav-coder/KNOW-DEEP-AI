import { useState } from "react";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw, ArrowRight, Database, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { SyncQueueModal } from "./SyncQueueModal";

export const OfflinePage = () => {
  const navigate = useNavigate();
  const { pendingCount, isOnline, syncNow, isSyncing } = useBackgroundSync();
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  const handleRetry = () => {
    if (navigator.onLine) {
      syncNow().then(() => {
        navigate("/chat");
      });
    } else {
      window.location.reload();
    }
  };

  const handleContinueOffline = () => {
    navigate("/chat");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 max-w-lg mx-auto bg-card/60 backdrop-blur-md border border-border/80 p-6 sm:p-8 rounded-2xl shadow-xl"
      >
        {/* Offline Icon */}
        <motion.div
          initial={{ y: -15 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner"
        >
          <div className="w-16 h-16 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-amber-400" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-extrabold mb-3 text-foreground tracking-tight"
        >
          {isOnline ? "Connection Restored" : "Offline Mode Active"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed"
        >
          Know Deep stores all your actions, prompts, and settings safely in{" "}
          <strong className="text-foreground">LocalStorage</strong> while offline. Once your internet
          connection is restored, they are automatically pushed to the backend.
        </motion.p>

        {/* LocalStorage Queue Status */}
        <div className="mb-6 p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>LocalStorage Action Queue:</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
            {pendingCount} Pending Action{pendingCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            onClick={handleContinueOffline}
            size="lg"
            className="w-full sm:w-auto px-6 py-5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-md shadow-cyan-500/20"
          >
            Continue in Offline Mode
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            onClick={handleRetry}
            size="lg"
            variant="outline"
            disabled={isSyncing}
            className="w-full sm:w-auto px-5 py-5 text-sm border-border hover:bg-muted rounded-xl text-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : isOnline ? "Push to Backend" : "Retry Connection"}
          </Button>
        </motion.div>

        <div className="mt-4">
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="text-xs text-muted-foreground hover:text-cyan-400 underline transition-colors"
          >
            Inspect Stored Actions Queue
          </button>
        </div>

        {/* Additional status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
            }`}
          />
          <span>
            {isOnline
              ? "Reconnected to internet. Auto-sync is active."
              : "Listening for connection restoration..."}
          </span>
        </motion.div>
      </motion.div>

      <SyncQueueModal isOpen={isQueueModalOpen} onClose={() => setIsQueueModalOpen(false)} />
    </div>
  );
};
