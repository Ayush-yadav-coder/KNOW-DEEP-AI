import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { motion, AnimatePresence } from "framer-motion";
import { FastForward } from "lucide-react";

interface TypewriterMarkdownProps {
  content: string;
  isStreaming?: boolean;
  animate?: boolean;
  speed?: number; // ms per tick
  onComplete?: () => void;
  className?: string;
  showSkipButton?: boolean;
}

export function TypewriterMarkdown({
  content,
  isStreaming = false,
  animate = false,
  speed = 12,
  onComplete,
  className = "",
  showSkipButton = false,
}: TypewriterMarkdownProps) {
  // When streaming or when animation is not requested, directly show the content to eliminate lag
  const [displayedText, setDisplayedText] = useState(() => (animate && !isStreaming ? "" : content));
  const [isTyping, setIsTyping] = useState(() => Boolean(animate && !isStreaming));
  const fullTextRef = useRef(content);
  fullTextRef.current = content;

  const displayedLengthRef = useRef(displayedText.length);
  displayedLengthRef.current = displayedText.length;

  // Handle instant skip
  const handleSkip = () => {
    setDisplayedText(fullTextRef.current);
    setIsTyping(false);
    onComplete?.();
  };

  useEffect(() => {
    if (isStreaming || !animate) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    let animationFrameId: number;
    let lastTickTime = performance.now();

    const tick = (now: number) => {
      const target = fullTextRef.current;
      const currentLen = displayedLengthRef.current;

      if (currentLen < target.length) {
        setIsTyping(true);
        const elapsed = now - lastTickTime;
        
        // Dynamic fast typing speed
        const backlog = target.length - currentLen;
        let step = 1;
        let effectiveSpeed = speed;

        if (backlog > 200) {
          step = 10;
          effectiveSpeed = 2;
        } else if (backlog > 80) {
          step = 5;
          effectiveSpeed = 4;
        } else if (backlog > 30) {
          step = 2;
          effectiveSpeed = 6;
        }

        if (elapsed >= effectiveSpeed) {
          lastTickTime = now;
          const nextLen = Math.min(target.length, currentLen + step);
          setDisplayedText(target.slice(0, nextLen));
        }

        animationFrameId = requestAnimationFrame(tick);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [content, isStreaming, animate, speed, onComplete]);

  return (
    <div className={`relative group/typewriter ${className}`}>
      {/* Skip typing button on hover / active */}
      <AnimatePresence>
        {isTyping && showSkipButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={handleSkip}
            className="absolute -top-3 right-0 z-20 flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-900/80 dark:bg-slate-800/90 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-md backdrop-blur-md transition-all"
            title="Skip typing animation"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>Skip</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 leading-relaxed space-y-4">
        <ReactMarkdown
          components={{
            code({ node, className: codeClass, children, ...props }) {
              const match = /language-(\w+)/.exec(codeClass || "");
              const isInline = !match && !String(children).includes("\n");

              if (isInline) {
                return (
                  <code
                    className="bg-slate-100 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm border border-slate-200/60 dark:border-slate-700/60"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <div className="w-full my-4">
                  <CodeBlock language={match?.[1]} className={codeClass}>
                    {String(children)}
                  </CodeBlock>
                </div>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <table className="min-w-full divide-y divide-border">
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100/90 dark:bg-slate-800/70">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300">
                  {children}
                </td>
              );
            },
            strong({ children }) {
              return (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              );
            },
            p({ children }) {
              return <p className="mb-3 leading-relaxed inline">{children}</p>;
            },
            ul({ children }) {
              return <ul className="my-2.5 ml-5 list-disc space-y-1.5">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="my-2.5 ml-5 list-decimal space-y-1.5">{children}</ol>;
            },
          }}
        >
          {displayedText}
        </ReactMarkdown>

        {/* Dynamic Typewriter Glowing Cursor */}
        {(isTyping || isStreaming) && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-xs ml-1.5 align-middle shadow-[0_0_10px_rgba(0,240,255,0.7)]"
          />
        )}
      </div>
    </div>
  );
}
