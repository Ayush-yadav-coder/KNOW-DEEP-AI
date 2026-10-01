import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { KNOWDEEP_LOGO_URL } from "@/lib/branding";

interface ThinkingStepperProps {
  isLoading: boolean;
  showUpgradePrompt?: boolean;
  userPrompt?: string;
}

const THINKING_STAGES = [
  "Thinking...",
  "Understanding prompt...",
  "Synthesizing answer...",
  "Drafting response...",
];

export function ThinkingStepper({ isLoading, userPrompt }: ThinkingStepperProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // Compute dynamic prompt-aware stages based on user query intent
  const stages = React.useMemo(() => {
    if (!userPrompt || typeof userPrompt !== "string") {
      return [
        "Thinking...",
        "Understanding prompt intent...",
        "Synthesizing response...",
        "Drafting answer...",
      ];
    }

    const lower = userPrompt.toLowerCase();

    // 1. Coding & Programming
    if (
      /python|code|javascript|typescript|react|html|css|function|api|sql|database|debug|algorithm|class|loop|c\+\+|java|variable|git|repo|syntax|backend|frontend|node|express|json|compiler/i.test(
        lower
      )
    ) {
      return [
        "Parsing code context & syntax...",
        "Analyzing algorithms & structures...",
        "Optimizing logic & code patterns...",
        "Drafting solution & code blocks...",
      ];
    }

    // 2. Math, Science & Formulas
    if (
      /math|formula|equation|physics|calculate|theorem|solve|biology|chemistry|derivative|integral|algebra|geometry|calculus|proof/i.test(
        lower
      )
    ) {
      return [
        "Analyzing mathematical terms...",
        "Solving step-by-step equations...",
        "Verifying formula accuracy...",
        "Formatting mathematical solution...",
      ];
    }

    // 3. Creative & Writing
    if (
      /write|story|poem|essay|script|design|creative|compose|draft|blog|article|email|letter|song|character/i.test(
        lower
      )
    ) {
      return [
        "Interpreting creative vision...",
        "Composing narrative & structure...",
        "Refining tone & prose...",
        "Finalizing creative draft...",
      ];
    }

    // 4. Research & Explanations (e.g. "What is Python?", "Explain AI")
    if (
      /explain|what is|whats|who is|history|definition|summarize|overview|compare|difference|how does|why is/i.test(
        lower
      )
    ) {
      const topicMatch = lower.match(/(?:what is|explain|whats|definition of)\s+([a-zA-Z0-9\s]+)/i);
      const topic = topicMatch?.[1]?.trim() ? topicMatch[1].trim().slice(0, 18) : null;

      return [
        topic ? `Analyzing ${topic}...` : "Analyzing topic & knowledge base...",
        "Synthesizing core principles...",
        "Structuring key insights...",
        "Drafting clear explanation...",
      ];
    }

    // 5. Default General Intelligence
    return [
      "Thinking...",
      "Understanding prompt intent...",
      "Synthesizing response...",
      "Drafting answer...",
    ];
  }, [userPrompt]);

  useEffect(() => {
    if (!isLoading) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % stages.length);
    }, 1300);

    return () => clearInterval(interval);
  }, [isLoading, stages]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2.5 py-2 select-none"
    >
      <div className="w-5 h-5 rounded-md overflow-hidden border border-cyan-500/40 ring-1 ring-cyan-500/20 bg-slate-950 shrink-0 flex items-center justify-center">
        <img src={KNOWDEEP_LOGO_URL} alt="KnowDeep AI" className="w-full h-full object-cover" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-medium shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: "3s" }} />
        
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
            className="tracking-tight"
          >
            {stages[stepIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

