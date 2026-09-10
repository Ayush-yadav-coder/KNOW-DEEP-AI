import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 space-y-2"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>AI follow-up questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(suggestion)}
              className="text-xs h-8 gap-1 bg-white/50 dark:bg-muted/30 hover:bg-white/80 dark:hover:bg-muted/50"
            >
              {suggestion}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
