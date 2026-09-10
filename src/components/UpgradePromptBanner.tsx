import { motion } from "framer-motion";
import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UpgradePromptBannerProps {
  variant?: "loading" | "result";
}

export const UpgradePromptBanner = ({ variant = "loading" }: UpgradePromptBannerProps) => {
  if (variant === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            Want faster responses? Pro users get results 10x faster!
          </span>
        </div>
        <Link to="/pricing">
          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90">
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-purple-500" />
          <span className="text-sm">
            This was a standard response. Want 2x deeper analysis?
          </span>
        </div>
        <Link to="/pricing">
          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90">
            Try Pro
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
