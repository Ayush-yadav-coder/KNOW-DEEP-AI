import React from "react";
import { motion } from "framer-motion";
import { TypewriterMarkdown } from "./TypewriterMarkdown";
import { Sparkles } from "lucide-react";

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingMessage({ content, isStreaming = false }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-8 pt-1"
    >
      {/* Streaming Indicator Header */}
      {isStreaming && (
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-cyan-600 dark:text-cyan-400">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          <span>Generating answer...</span>
        </div>
      )}

      {/* Full-width Typewriter stream rendering */}
      <div className="w-full text-foreground">
        <TypewriterMarkdown
          content={content}
          isStreaming={isStreaming}
          animate={true}
          speed={10}
          showSkipButton={false}
        />
      </div>
    </motion.div>
  );
}
