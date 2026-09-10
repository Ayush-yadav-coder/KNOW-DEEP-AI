import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MessageFeedbackProps {
  messageId: string;
  onQuickDefinition?: () => void;
}

export function MessageFeedback({ messageId, onQuickDefinition }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    if (type === "down") {
      setShowFeedbackForm(true);
    } else {
      toast({ title: "Thanks for your feedback!" });
    }
  };

  const submitFeedback = () => {
    // In a real app, this would send to backend
    console.log("Feedback submitted:", { messageId, feedback, text: feedbackText });
    setSubmitted(true);
    setShowFeedbackForm(false);
    toast({ title: "Feedback submitted", description: "Thank you for helping us improve!" });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground mt-2"
      >
        <span>Thanks for your feedback!</span>
      </motion.div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Feedback buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${feedback === "up" ? "text-green-500 bg-green-500/10" : "text-muted-foreground"}`}
            onClick={() => handleFeedback("up")}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${feedback === "down" ? "text-red-500 bg-red-500/10" : "text-muted-foreground"}`}
            onClick={() => handleFeedback("down")}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Quick definition button */}
        {onQuickDefinition && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onQuickDefinition}
          >
            <Sparkles className="w-3 h-3" />
            Quick Summary
          </Button>
        )}
      </div>

      {/* Feedback form */}
      <AnimatePresence>
        {showFeedbackForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">What went wrong?</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowFeedbackForm(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Textarea
              placeholder="Tell us how we can improve..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <Button size="sm" onClick={submitFeedback} className="w-full">
              Submit Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro upgrade prompt after response */}
      {!showFeedbackForm && feedback !== "up" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs">Want 2x deeper analysis?</span>
            </div>
            <Link to="/pricing">
              <Button size="sm" className="h-6 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Try Pro
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
