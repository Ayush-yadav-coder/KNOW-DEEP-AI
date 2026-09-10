import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { MessageFeedback } from "./MessageFeedback";
import { FollowUpSuggestions } from "./FollowUpSuggestions";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, GitBranch, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onFollowUp?: (text: string) => void;
  previousUserMessage?: string;
}

// Local heuristic fallback used until AI returns
function localFollowUps(content: string): string[] {
  const suggestions: string[] = [];
  if (content.toLowerCase().includes("code") || content.includes("```")) {
    suggestions.push("Explain this code in plain English", "How can I optimize it?");
  }
  if (content.length > 500) {
    suggestions.push("Summarize this in 3 points");
  }
  if (suggestions.length === 0) {
    suggestions.push("Tell me more", "Give a concrete example");
  }
  return suggestions.slice(0, 3);
}

export function ChatMessage({ message, isLast = false, onFollowUp, previousUserMessage }: ChatMessageProps) {
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [aiFollowUps, setAiFollowUps] = useState<string[] | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === "user";
  const { toast } = useToast();
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI-powered, context-aware follow-up generation for the last assistant message
  useEffect(() => {
    if (isUser || !isLast || !onFollowUp) return;
    if (!message.content || message.content.length < 40) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke("follow-ups", {
          body: {
            userMessage: previousUserMessage || "",
            assistantMessage: message.content,
          },
        });
        const qs = (data as any)?.questions;
        if (!cancelled && Array.isArray(qs) && qs.length) {
          setAiFollowUps(qs.slice(0, 3));
        }
      } catch {
        /* keep heuristic */
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isUser, isLast, message.content, previousUserMessage, onFollowUp]);

  // Handle quick definition/summary
  const handleQuickDefinition = () => {
    if (onFollowUp) {
      onFollowUp("Summarize the above response in 2-3 short sentences.");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Message content has been copied.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
    setShowContextMenu(false);
  };

  const handleExportToNewBranch = () => {
    const url = new URL(window.location.origin + "/chat");
    url.searchParams.set("q", message.content);
    window.open(url.toString(), "_blank");
    setShowContextMenu(false);
    toast({
      title: "Exported to New Branch",
      description: "Opened a new chat tab with this message pre-populated.",
    });
  };

  // Robust long-press handler for mobile touch and desktop mouse hold
  const startLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setShowContextMenu(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(40); } catch { /* ignore */ }
      }
    }, 500); // 500ms long press threshold
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Content to display
  const displayContent = showQuickSummary && message.content.length > 300
    ? message.content.slice(0, 200) + "..."
    : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 relative`}
    >
      {/* Backdrop overlay to close context menu when clicking outside */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowContextMenu(false)}
        />
      )}

      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setShowContextMenu(true);
        }}
        onTouchStart={startLongPress}
        onTouchEnd={clearLongPress}
        onTouchMove={clearLongPress}
        onMouseDown={startLongPress}
        onMouseUp={clearLongPress}
        onMouseLeave={clearLongPress}
        className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl shadow-md select-text transition-all ${
          isUser
            ? "bg-blue-600 text-white p-4"
            : "bg-white/70 dark:bg-muted/50 backdrop-blur-md border border-white/50 dark:border-border/50 p-4"
        }`}
      >
        {/* Floating Context Menu on Long Press */}
        <AnimatePresence>
          {showContextMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 ${isUser ? "right-0" : "left-0"} top-full mt-2 bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-1.5 min-w-[200px] backdrop-blur-xl`}
            >
              <button 
                type="button"
                onClick={handleCopyText}
                className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{isCopied ? "Copied!" : "Copy"}</span>
              </button>
              
              <button 
                type="button"
                onClick={handleExportToNewBranch}
                className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-cyan-500" />
                <span>Export to New Branch</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && !String(children).includes("\n");
                  
                  if (isInline) {
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <CodeBlock language={match?.[1]} className={className}>
                      {String(children)}
                    </CodeBlock>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-border">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      {children}
                    </td>
                  );
                },
                strong({ children }) {
                  return (
                    <strong className="font-semibold text-foreground bg-primary/10 px-0.5 rounded">
                      {children}
                    </strong>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Feedback and follow-ups for assistant messages */}
        {!isUser && (
          <>
            <MessageFeedback 
              messageId={message.id} 
              onQuickDefinition={handleQuickDefinition}
            />
            
            {isLast && onFollowUp && (
              <FollowUpSuggestions
                suggestions={aiFollowUps ?? localFollowUps(message.content)}
                onSelect={onFollowUp}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
