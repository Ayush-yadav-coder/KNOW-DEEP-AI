import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, Search, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const thinkingSteps = [
  { text: "Searching sources...", icon: Search },
  { text: "Analyzing connections...", icon: Brain },
  { text: "Synthesizing response...", icon: Sparkles },
  { text: "Optimizing output...", icon: Zap },
];

interface ThinkingStepperProps {
  isLoading: boolean;
  showUpgradePrompt?: boolean;
}

export function ThinkingStepper({ isLoading, showUpgradePrompt = true }: ThinkingStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const step = thinkingSteps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-start gap-2"
    >
      <div className="bg-white/70 dark:bg-muted/50 backdrop-blur-md border border-white/50 dark:border-border/50 p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm font-medium text-foreground"
              >
                {step.text}
              </motion.span>
            </AnimatePresence>
            <div className="flex gap-1 mt-1">
              {thinkingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-1 rounded-full transition-all ${
                    idx <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pro upgrade prompt while waiting */}
      {showUpgradePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
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
      )}
    </motion.div>
  );
}
