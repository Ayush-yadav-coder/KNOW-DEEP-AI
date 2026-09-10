import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Lightbulb, Code2, BookOpen, Palette, Calculator } from "lucide-react";

interface SmartSuggestionsProps {
  onSelect: (suggestion: string) => void;
  context?: "general" | "code" | "creative" | "learning";
}

const suggestionSets = {
  general: [
    { icon: Lightbulb, text: "Explain a complex topic simply", prompt: "Explain quantum computing in simple terms that anyone can understand" },
    { icon: Code2, text: "Help me code something", prompt: "Help me write a function that " },
    { icon: BookOpen, text: "Summarize an article", prompt: "Summarize this article for me: " },
    { icon: Palette, text: "Be creative with me", prompt: "Write a creative story about " },
    { icon: Calculator, text: "Solve a problem", prompt: "Help me solve this problem step by step: " },
    { icon: Sparkles, text: "Surprise me!", prompt: "Tell me something fascinating I probably don't know" },
  ],
  code: [
    { icon: Code2, text: "Debug my code", prompt: "Help me debug this code: " },
    { icon: Lightbulb, text: "Optimize performance", prompt: "How can I optimize this code for better performance? " },
    { icon: BookOpen, text: "Explain this code", prompt: "Explain what this code does step by step: " },
    { icon: Sparkles, text: "Refactor suggestion", prompt: "Suggest refactoring improvements for: " },
  ],
  creative: [
    { icon: Palette, text: "Write a poem", prompt: "Write a poem about " },
    { icon: Sparkles, text: "Story starter", prompt: "Start a story with an unexpected twist about " },
    { icon: Lightbulb, text: "Creative ideas", prompt: "Give me 5 creative ideas for " },
    { icon: BookOpen, text: "World building", prompt: "Help me create a fictional world where " },
  ],
  learning: [
    { icon: BookOpen, text: "Teach me about", prompt: "Teach me about " },
    { icon: Calculator, text: "Practice problems", prompt: "Give me practice problems for " },
    { icon: Lightbulb, text: "Study tips", prompt: "What are effective study strategies for " },
    { icon: Sparkles, text: "Quiz me", prompt: "Quiz me on " },
  ],
};

export function SmartSuggestions({ onSelect, context = "general" }: SmartSuggestionsProps) {
  const suggestions = suggestionSets[context] || suggestionSets.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2"
    >
      {suggestions.map((suggestion, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onSelect(suggestion.prompt)}
          className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 text-left transition-all group"
        >
          <suggestion.icon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm truncate">{suggestion.text}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
