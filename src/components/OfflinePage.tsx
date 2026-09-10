import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/20 dark:bg-red-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 max-w-md mx-auto"
      >
        {/* Offline Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
        >
          No Internet Connection
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8 text-lg"
        >
          Check your connection and try again
        </motion.p>

        {/* Retry Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleRetry}
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white rounded-xl"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </Button>
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Waiting for connection...</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
