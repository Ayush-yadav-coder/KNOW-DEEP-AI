import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProUpgradePromptProps {
  variant: "waiting" | "after-response" | "comparison";
  onClose?: () => void;
}

export const ProUpgradePrompt = ({ variant, onClose }: ProUpgradePromptProps) => {
  if (variant === "waiting") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
      >
        <Zap className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-muted-foreground">
          Tired of waiting? Pro users get responses 10x faster.
        </span>
        <Link to="/pricing">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700">
            Upgrade Now
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (variant === "after-response") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
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
  }

  // Comparison card
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <div className="w-full max-w-2xl glass rounded-3xl p-6 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 mb-4">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Get the Turbo Experience</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
            <p className="text-muted-foreground">
              All features remain free, but Pro takes your speed and intelligence to the next level.
            </p>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Standard */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </div>
                Standard (Current)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Good responses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Standard server speed
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Basic AI model
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 relative">
              <div className="absolute -top-3 left-4">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                  Recommended
                </span>
              </div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                Pro
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>Smarter & deeper reasoning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">10x faster response time</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  Priority access during busy hours
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <Link to="/pricing" className="block">
            <Button className="w-full h-12 text-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 glow-primary">
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
